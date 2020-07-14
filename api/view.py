import os
import json

import flask
from flask import Flask, request

from utils import color_attacking

SECRET_KEY = 'oJpcTZ1JLCGTbXlmxWpAjB1tljbKQLJW'

app = Flask(__name__)

@app.route("/boardviz", methods=['GET'])
def fen_to_mask():
    fen = request.values['fen']
    board_bgs = color_attacking(fen)
    response = flask.jsonify(board_bgs)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port='80')
