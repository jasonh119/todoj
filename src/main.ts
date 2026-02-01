import { initBoard } from './components/board';
import { loadBoard } from './storage/storage';
import './styles/main.css';

const board = loadBoard();
initBoard(board);
