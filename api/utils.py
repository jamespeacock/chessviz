import chess
from chess import Board
import random


def who(player):
    return "White" if player == chess.WHITE else "Black"


def random_player(board):
    _move = random.choice(list(board.legal_moves))
    return _move.uci()


def display_board(board, use_svg=False):
    if use_svg:
        return board._repr_svg_()
    else:
        return "<pre>" + str(board) + "</pre>"


def calculate_attacking(board: chess.BaseBoard):
    w_builder = []
    b_builder = []
    for square in chess.SQUARES:
        atks = board.attacks_mask(square)
        mask = chess.BB_SQUARES[square]
        color = bool(board.occupied_co[chess.WHITE] & mask)
        if color:
            w_builder.append(atks)
        else:
            b_builder.append(atks)

    w_atk = [0] * 64
    b_atk = [0] * 64
    for square in chess.SQUARES:
        for msk in w_builder:
            w_atk[square] += 1 if msk & chess.BB_SQUARES[square] else 0
        for msk in b_builder:
            b_atk[square] += 1 if msk & chess.BB_SQUARES[square] else 0

    return {'w': w_atk, 'b': b_atk}


def attacking_from_fen(fen):
    board = chess.Board(fen=fen)
    return calculate_attacking(board)


def lookup_color(w, b):
    # TODO convert to rgba and allow configurable opacity
    color_map = {
        -3: "#FF8000",
        -2: "#FF952B",
        -1: "#FFAA55",
        0: "#000000",
        1: "#5555FF",
        2: "#2B2BFF",
        3: "#0000FF"
    }
    opacity = "A0"
    for c in color_map:
        color_map[c] += opacity

    total = w+b
    sign = w-b
    sign = min(sign, 3) if sign > 0 else max(-3, sign)
    return color_map[sign] if total > 0 else "#00000000"


def color_board(atk):
    bgs = {}
    for s in chess.SQUARES:
        bgs[chess.SQUARE_NAMES[s]] = {"backgroundColor": lookup_color(atk['w'][s], atk['b'][s])}
    return bgs


def color_attacking(fen):
    atk_dict = attacking_from_fen(fen)
    return color_board(atk_dict)


def start_game():
    board = chess.Board()
    viz = chess.SquareSet()
    return board, viz


def valid_move(board: Board, m):
    if not board.is_valid():
        return False
    moves = board.generate_legal_moves()
    for _move in moves:
        if m == _move.uci():
            return True
    return False


def move(board, m):
    _move = chess.Move.from_uci(m)

    if valid_move(board, m):
        moved = True
        board.push(_move)
    return board, moved
