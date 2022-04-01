"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultipleBar = void 0;
const progress_1 = __importDefault(require("progress"));
const readline = __importStar(require("readline"));
class MultipleBar {
    constructor() {
        this.stream = process.stderr;
        this.cursor = 1;
        this.bars = [];
        this.terminates = 0;
    }
    newBar(schema, options) {
        options.stream = this.stream;
        const bar = new progress_1.default(schema, options);
        this.bars.push(bar);
        const index = this.bars.length - 1;
        this.move(index);
        this.stream.write('\n');
        this.cursor += 1;
        const barObj = bar;
        barObj.otick = bar.tick;
        barObj.oterminate = bar.terminate;
        barObj.tick = (value, opts) => {
            this.tick(index, value, opts);
        };
        barObj.terminate = () => {
            this.terminates += 1;
            if (this.terminates === this.bars.length) {
                this.terminate();
            }
        };
        return bar;
    }
    terminate() {
        this.move(this.bars.length);
        readline.clearLine(this.stream, 0);
        if (!this.stream.isTTY)
            return;
        this.stream.cursorTo(0);
    }
    move(index) {
        if (!this.stream.isTTY)
            return;
        this.stream.moveCursor(0, index - this.cursor);
        this.cursor = index;
    }
    tick(index, value, options) {
        const bar = this.bars[index];
        if (bar) {
            this.move(index);
            bar.otick(value, options);
        }
    }
}
exports.MultipleBar = MultipleBar;
