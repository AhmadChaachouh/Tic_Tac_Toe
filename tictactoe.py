#Bahaaeddine RAMLAWI 210919
#Hajar KATTAA 214082
#Ahmad CHAACHOUH 200438

import http.server
import socketserver
import json
import random
from urllib.parse import parse_qs

PORT = 8080
board = [[' ' for _ in range(3)] for _ in range(3)]
counter = 1
max_depth = 9
randomiser = False
alphabeta = True

############  Evaluation Function  ############
def evaluate(board):
    score = 0
    #check for wins
    var = check_winner(board)[0]
    if var == 'O':
        score = 10
    elif var == 'X':
        score = -10
    elif var == 'Tie':
        score = 0
    # Check rows, columns, and diagonals for two in a row    
    for i in range(3):
        row = [board[i][0], board[i][1], board[i][2]]
        col = [board[0][i], board[1][i], board[2][i]]
        score += score_line(row)
        score += score_line(col)

    diagonal1 = [board[0][0], board[1][1], board[2][2]]
    diagonal2 = [board[0][2], board[1][1], board[2][0]]
    score += score_line(diagonal1)
    score += score_line(diagonal2)
    return score

def score_line(line):
    if line.count('O') == 2 and line.count(' ') == 1:
        return -3
    elif line.count('X') == 2 and line.count(' ') == 1:
        return 3
    else:
        return 0

############  Check Winners  ############
def check_winner(board):
    ending = [(0,0),(0,0),(0,0)]
    #Check Rows
    for row in range(3):
        if board[row][0] == board[row][1] == board[row][2] != ' ':
            ending = [(row,0),(row,1),(row,2)]
            return (board[row][0],ending)
    #Check Columns
    for col in range(3):
        if board[0][col] == board[1][col] == board[2][col] != ' ':
            ending = [(0,col),(1,col),(2,col)]
            return (board[0][col],ending)
    #Check Diagonals
    if board[0][0] == board[1][1] == board[2][2] != ' ':
        ending = [(0,0),(1,1),(2,2)]
        return (board[0][0],ending)
    if board[0][2] == board[1][1] == board[2][0] != ' ':
        ending = [(0,2),(1,1),(2,0)]
        return (board[0][2],ending)
    #No Winner
    if any(' ' in row for row in board):
        return (None, None)
    return ('Tie',ending)

def value(state):
    result,_ = check_winner(state)
    if result == 'X':
        return -100
    elif result == 'O':
        return 100
    elif result == 'Tie':
        return 0
    return None

############  Minimax Functions  ############
def minimax(board, depth, is_max, alpha, beta):
    result = value(board)
    if result is not None or depth >= max_depth:
        if depth >= max_depth:
            return evaluate(board)  # Use the evaluation function when depth limit is reached
        return result
    if is_max:
        return max_value(board, depth, alpha, beta)
    else:
        return min_value(board, depth, alpha, beta)

############  Maximizing Functions  ############
def max_value(board, depth, alpha, beta):
    global alphabeta
    max_eval = -float('inf')
    for i in range(3):
        for j in range(3):
            if board[i][j] == ' ':
                board[i][j] = 'O'
                if depth >= max_depth:
                    return evaluate(board)  # Use evaluation function when depth limit is reached
                else:
                    eval = minimax(board, depth + 1, False, alpha, beta)
                board[i][j] = ' '
                max_eval = max(max_eval, eval)
                if alphabeta:
                    if eval >= beta:
                        return eval
                    alpha = max(alpha, eval)
    return max_eval

############  Minimizing Functions  ############
def min_value(board, depth, alpha, beta):
    global alphabeta
    min_eval = float('inf')
    for i in range(3):
        for j in range(3):
            if board[i][j] == ' ':
                board[i][j] = 'X'
                if depth >= max_depth:
                    return evaluate(board)  # Use evaluation function when depth limit is reached
                else:
                    eval = minimax(board, depth + 1, True, alpha, beta)
                board[i][j] = ' '
                min_eval = min(min_eval, eval)
                if alphabeta:
                    if eval <= alpha:
                        return eval
                    beta = min(beta, eval)
    return min_eval

############  AI Move  ############
def best_move(board,depth = 0,alpha = -100,beta = 100):
    if not randomiser:
        max_eval = -float('inf')
        optimal_moves = None
        for i in range(3):
            for j in range(3):
                if board[i][j] == ' ':
                    board[i][j] = 'O'
                    eval = minimax(board, depth, False, alpha, beta)
                    board[i][j] = ' '
                    if eval > max_eval:
                        max_eval = eval
                        optimal_moves = (i, j)
                    if alphabeta:
                        if eval >= beta:
                            return optimal_moves
                        alpha = max(alpha, eval)
        return optimal_moves
    else:
        available_moves = [(row, col) for row in range(3) for col in range(3) if board[row][col] == " "]
        if available_moves:
            row, col = random.choice(available_moves)
            board[row][col] = 'O'
            return row, col
    
def make_move(i, j):
    if board[i][j] == ' ':
        board[i][j] = 'X'
        move = (3,3)
        result,box = check_winner(board)
        if result is None:
            move = best_move(board)
            if move is not None:
                i, j = move
                board[i][j] = 'O'
            result,box = check_winner(board)
            if result == 'O':
                return move,"AI won the game!",box
            elif result == 'Tie':
                return move,"Game Over, It's a tie!",box
            return move,"",box
        else:
            if result == 'X':
                return move,"You won the game!",box
            elif result == 'Tie':
                return move,"Game Over, It's a tie!",box

############  HTTP Server  ############
class CustomHandler(http.server.SimpleHTTPRequestHandler): #POST and GET
    def do_GET(self):
        if self.path == '/':
            self.path = '/index.html'
        super().do_GET()

    ############  Get and Send AI Move to JavaScript  ############
    def do_POST(self):
        global board,counter
        if self.path == '/send_data':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode())
            input_data = data.get('data', '')
            row, column = input_data.get('row'),input_data.get('column')
            print("------------------------------------")
            print("|", counter, "- You ->  row: ", row, " column: ", column, " |")  # row and column chosen by the player.
            counter += 1
            returndata = make_move(row, column)
            (move, text, box) = returndata
            (row, column) = move
            response_data = {
                "row": row,
                "column": column,
                "text": text,
                "box": box
            }
            if text in ('', 'AI won the game!'):
                print("|", counter, "- AI  ->  row: ", row, " column: ", column, " |") # row and column chosen by the AI.
                print("------------------------------------")
                counter += 1
            else:
                print("------------------------------------")
            if text: print("\n>>  Result -> ", text, "\n")
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(response_data).encode())
        elif self.path == '/reset_game':
            self.reset_game()
        elif self.path == '/set_difficulty':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode())
            input_data = data.get('data', '')
            difficulty = input_data.get('difficulty')
            alphabeta = input_data.get('alphabeta')
            self.set_difficulty(difficulty)
            self.set_pruning(alphabeta)
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps("ignore").encode())
        else:
            self.send_error(404)
    
    ############  Game Reset  ############
    def reset_game(self):
        global board,counter
        board = [[' ' for _ in range(3)] for _ in range(3)]
        counter = 1
        response_data = {
            "message": "Game reset successfully"
        }
        print("\n>>  Reset:  ->  ", response_data["message"],"\n")
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(response_data).encode())
    
    ############  Set Difficulty  ############
    def set_difficulty(self,diff):
        global max_depth,randomiser
        print("\n>>  Set Difficulty: -> ", diff )
        if diff == 'Impossible':
            max_depth = 9
            randomiser = False
        elif diff == 'Medium':
            max_depth = 1
            randomiser = False
        else:
            randomiser = True
    
    ############  Set Pruning Condition  ############
    def set_pruning(self,ab):
        global alphabeta
        if ab :
            alphabeta = True
        else:
            alphabeta = False
        print(">>  Set Pruning:    -> ",alphabeta,"\n")

with socketserver.TCPServer(("", PORT), CustomHandler) as httpd:
    print(f"Serving at port {PORT}")
    httpd.serve_forever()