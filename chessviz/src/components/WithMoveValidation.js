import React, { Component } from 'react'; // eslint-disable-line no-unused-vars
import PropTypes from 'prop-types';
import Chess from 'chess.js';

import Chessboard from 'chessboardjsx';

class HumanVsHuman extends Component {
  static propTypes = { children: PropTypes.func };

  state = {
    fen: 'start',
    // square styles for active drop squares
    dropSquareStyle: {},
    // custom square styles
    squareStyles: {},
    currentAttackStyles: {},
    // square with the currently clicked piece
    pieceSquare: '',
    // currently clicked square
    square: '',
    history: []
  };

  async componentDidMount() {
    this.game = new Chess();
    const colorStyle = await styleFromFen(this.game.fen())
    this.setState({
      currentAttackStyles: colorStyle,
      squareStyles: colorStyle
    })
  }

  // toggleAttack() {
  //   this.setState({
  //     squareStyles: styleFromFen(this.game.fen())
  //   })
  // }

  // keep clicked square style and remove hint squares
  removeHighlightSquare = () => {
    this.setState(({ pieceSquare, history }) => ({
      squareStyles: this.state.currentAttackStyles
    }));
  };

  // show possible moves
  highlightSquare = (sourceSquare, squaresToHighlight) => {
    const atkStyle = this.state.currentAttackStyles;
    const highlightStyles = [sourceSquare, ...squaresToHighlight].reduce(
      (a, c) => {
        return {
          ...a,
          ...{
            [c]: {
              background:
                'radial-gradient(circle, #fffc00 36%, transparent 40%)',
              borderRadius: '50%'
            }
          },
          ...atkStyle
        };
      },
      {}
    );

    this.setState(({ squareStyles }) => ({
      squareStyles: { ...squareStyles, ...highlightStyles }
    }));
  };

  onDrop = async ({ sourceSquare, targetSquare }) => {
    // see if the move is legal
    let move = this.game.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q' // always promote to a queen for example simplicity
    });

    // illegal move
    if (move === null) return;
    const atkStyles = await styleFromFen(this.game.fen())
    this.setState(({ history, pieceSquare }) => ({
      fen: this.game.fen(),
      history: this.game.history({ verbose: true }),
      // squareStyles: squareStyling({ pieceSquare, history })
      squareStyles: atkStyles,
      currentAttackStyles: atkStyles
    }));
  };

  onMouseOverSquare = square => {
    // get list of possible moves for this square
    let moves = this.game.moves({
      square: square,
      verbose: true
    });

    // exit if there are no moves available for this square
    if (moves.length === 0) return;

    let squaresToHighlight = [];
    for (var i = 0; i < moves.length; i++) {
      squaresToHighlight.push(moves[i].to);
    }

    this.highlightSquare(square, squaresToHighlight);
  };

  onMouseOutSquare = square => this.removeHighlightSquare(square);

  // central squares get diff dropSquareStyles
  onDragOverSquare = ({piece, square}) => {
    this.setState({
      dropSquareStyle:
        square === 'e4' || square === 'd4' || square === 'e5' || square === 'd5'
          ? { backgroundColor: 'cornFlowerBlue' }
          : { boxShadow: 'inset 0 0 1px 4px rgb(255, 255, 0)' }
    });
  };

  onSquareClick = async square => {
    this.setState(({ history }) => ({
      // squareStyles: squareStyling({ pieceSquare: square, history }),
      pieceSquare: square
    }));

    let move = this.game.move({
      from: this.state.pieceSquare,
      to: square,
      promotion: 'q' // always promote to a queen for example simplicity
    });

    // illegal move
    if (move === null) return;
    const atkStyles = await styleFromFen(this.game.fen())
    this.setState({
      fen: this.game.fen(),
      squareStyles: atkStyles,
      currentAttackStyles: atkStyles,
      history: this.game.history({ verbose: true }),
      pieceSquare: ''
    });
  };

  onSquareRightClick = async square => {
    const attackStyles = await styleFromFen(this.game.fen());
    this.setState({
      squareStyles: attackStyles
    });
  }

  render() {
    const { fen, dropSquareStyle, squareStyles } = this.state;

    return this.props.children({
      squareStyles,
      position: fen,
      onMouseOverSquare: this.onMouseOverSquare,
      onMouseOutSquare: this.onMouseOutSquare,
      onDrop: this.onDrop,
      dropSquareStyle,
      onDragOverSquare: this.onDragOverSquare,
      onSquareClick: this.onSquareClick,
      onSquareRightClick: this.onSquareRightClick
    });
  }
}

export default function WithMoveValidation() {

  const lightColor = "#FFFFFF"
  const darkColor = "#AAAAAA"

  return (
    <div>
      <HumanVsHuman>
        {({
          position,
          onDrop,
          onMouseOverSquare,
          onMouseOutSquare,
          squareStyles,
          dropSquareStyle,
          onDragOverSquare,
          onSquareClick,
          onSquareRightClick
        }) => (
          <Chessboard
            id="humanVsHuman"
            calcWidth={({ screenWidth }) => (screenWidth < 500 ? 350 : 480)}
            position={position}
            onDrop={onDrop}
            onMouseOverSquare={onMouseOverSquare}
            onMouseOutSquare={onMouseOutSquare}
            boardStyle={{
              borderRadius: '5px',
              boxShadow: `0 5px 15px rgba(0, 0, 0, 0.5)`
            }}
            squareStyles={squareStyles}
            lightSquareStyle={{backgroundColor: lightColor}}
            darkSquareStyle={{backgroundColor: darkColor}}
            dropSquareStyle={dropSquareStyle}
            onDragOverSquare={onDragOverSquare}
            onSquareClick={onSquareClick}
            onSquareRightClick={onSquareRightClick}
          />
        )}
      </HumanVsHuman>
    </div>
  );
}


// const squareStyling = ({ pieceSquare, history }) => {
//   const sourceSquare = history.length && history[history.length - 1].from;
//   const targetSquare = history.length && history[history.length - 1].to;
//   return {
//     [pieceSquare]: { backgroundColor: 'rgba(255, 255, 0, 0.0)' },
//     ...(history.length && {
//       [sourceSquare]: {
//         backgroundColor: 'rgba(255, 255, 0, 0.0)'
//       }
//     }),
//     ...(history.length && {
//       [targetSquare]: {
//         backgroundColor: 'rgba(255, 255, 0, 0.0)'
//       }
//     })
//   };
// };

// Chess.SQUARES

const styleFromFen = async (fen) => {
  const url = 'http://localhost:80/boardviz?fen=' + encodeURIComponent(fen)
  return await fetch(url)
      .then(res => res.json())
      .then(
          (result) => {
            return result
          },
          // Note: it's important to handle errors here
          // instead of a catch() block so that we don't swallow
          // exceptions from actual bugs in components.
          (error) => {
            console.log(error)
            return {}
          }
      );
}