const ProgressBar = require('progress');


class Multibar{
  constructor(){
    this.stream     = process.stderr;
    this.cursor     = 1;
    this.bars       = [];
    this.terminates = 0;
  }

  newBar(schema, options) {
    options.stream = this.stream;
    var bar = new ProgressBar(schema, options);
    this.bars.push(bar);
    var index = this.bars.length - 1;

    // alloc line
    this.move(index);
    this.stream.write('\n');
    this.cursor ++;

    // replace original
    var self  = this;
    bar.otick = bar.tick;
    bar.oterminate = bar.terminate;
    bar.tick = function(value, options) {
      self.tick(index, value, options);
    }
    bar.terminate = function() {
      self.terminates++;
      if (self.terminates == self.bars.length) {
        self.terminate();
      }
    }

    return bar;
  }

  terminate(){
    this.move(this.bars.length);
    this.stream.clearLine();
    this.stream.cursorTo(0);
  }

  move(index){
    if (!this.stream.isTTY) return;
    this.stream.moveCursor(0, index - this.cursor);
    this.cursor = index;
  }

  tick(index, value, options) {
    var bar = this.bars[index];
    if (bar) {
      this.move(index);
      bar.otick(value, options);
    }
  }
}

module.exports = Multibar;
