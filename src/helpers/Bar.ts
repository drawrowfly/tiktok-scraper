import ProgressBar from 'progress';
import * as readline from 'readline';

export class MultipleBar {
    public stream: any;

    public cursor: number;

    public bars: ProgressBar[];

    public terminates: number;

    constructor() {
        this.stream = process.stderr;
        this.cursor = 1;
        this.bars = [];
        this.terminates = 0;
    }

    newBar(schema, options) {
        // eslint-disable-next-line no-param-reassign
        options.stream = this.stream;
        const bar = new ProgressBar(schema, options);
        this.bars.push(bar);
        const index = this.bars.length - 1;

        // alloc line
        this.move(index);
        this.stream.write('\n');
        this.cursor += 1;

        // replace original
        const barObj = bar as any;
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
            (bar as any).otick(value, options);
        }
    }
}
