// @ts-nocheck
/* eslint-disable */
import ProgressBar from 'progress';
import * as readline from 'readline';

export class MultipleBar {
    constructor() {
        this.stream = process.stderr;
        this.cursor = 1;
        this.bars = [];
        this.terminates = 0;
    }

    newBar(schema, options) {
        options.stream = this.stream;
        const bar = new ProgressBar(schema, options);
        this.bars.push(bar);
        const index = this.bars.length - 1;

        // alloc line
        this.move(index);
        this.stream.write('\n');
        this.cursor += 1;

        // replace original
        const self = this;
        bar.otick = bar.tick;
        bar.oterminate = bar.terminate;
        bar.tick = (value, options) => {
            self.tick(index, value, options);
        };
        bar.terminate = () => {
            self.terminates += 1;
            if (self.terminates === self.bars.length) {
                self.terminate();
            }
        };

        return bar;
    }

    terminate() {
        this.move(this.bars.length);

        readline.clearLine();
        if (!this.stream.isTTY) return;
        this.stream.cursorTo(0);
    }

    move(index) {
        if (!this.stream.isTTY) return;
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
