"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
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
