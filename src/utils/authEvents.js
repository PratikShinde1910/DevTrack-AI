import { EventEmitter } from 'eventemitter3';

const authEvents = new EventEmitter();

export const AUTH_LOGOUT = 'AUTH_LOGOUT';

export default authEvents;
