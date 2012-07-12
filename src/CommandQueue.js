var CommandQueue = function()
{
    this.commands = null;
    this.cursor = null;
};

CommandQueue.prototype = {

    init: function()
    {
        this.commands = [];
        this.cursor = -1;
    },

    execute: function(command)
    {
        command.execute();
        this.commands.push(command);
        // @todo need to splice array so we dont have none executed state down our queue.
        this.cursor = this.commands.length;
    },

    redo: function()
    {
        console.log(this.cursor);
        if (this.valid())
        {
            this.commands[this.cursor].execute();
            this.cursor++;
        }
    },

    undo: function()
    {
        if (this.mayUndo())
        {
            this.cursor--;
            this.commands[this.cursor].revert();
        }
    },

    mayUndo: function()
    {
        return !!this.commands[this.cursor-1];
    },

    valid: function()
    {
        return !!this.commands[this.cursor];
    }
};
