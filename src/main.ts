import './components/todo-app';
import { loadBoard } from './storage/storage';
import './styles/main.css';

const board = loadBoard();
const app = document.querySelector('todo-app');
if (app) {
  (app as import('./components/todo-app').TodoApp).board = board;
}
