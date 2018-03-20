// test-setup.js
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });

// Shim for React complaining about requestAnimationFrame being available in the test environment
window.requestAnimationFrame = function(callback) {
  setTimeout(callback, 0);
 };
