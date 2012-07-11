/*global LockedRatioMode:false, DefaultMode:false*/

// -----------------------------------------------------------------------------
//                          ResizeInterAction
// Provides the ImageAreaSelection with resize behaviour and attaches 
// mousedown, -move and -up listeners to do so.
// The actual calculation is then delegated to the the *Mode objects (fe: DefaultMode). 
// @see the 'Modes Section'
// -----------------------------------------------------------------------------

var ResizeInteraction = function()
{
    this.image_selection = null;
    this.handles = null;
    this.last_mousepos = null;
    this.mode = null;
    this.boundry = null;
};

ResizeInteraction.prototype = {

    /**
     * Hooks up with the given ImageAreaSelection, 
     * hence gets to know it's handles and registers the required events.
     */
    init: function(image_selection)
    {
        this.image_selection = image_selection;
        this.handles = this.image_selection.getHandles();
        this.canvas = $(
            this.image_selection.getLayer().getCanvas()
        );
        this.boundry = this.image_selection.getImageBoundry();
        this.mode = new DefaultMode();
        this.mode.init(this);
        this.last_mousepos = null;
        this.registerHandleEvents();
    },

    /**
     * Registers mousedown, mousemove and mouseup events together with their corresponding touch events.
     * Makes sure that the mousemove handler is only active as long as the resize/drag mode is too.
     */
    registerHandleEvents: function()
    {
        var that = this,
            registerHandle = function(index)
            {
                var handle = that.handles[index];
                var mousemoveEventHandler = function(event){ that.onMouseMove(event, index); };
                var mouseupEventHandler = function(event){ 
                    that.image_selection.shapes_group.setDraggable(true);
                    that.last_mousepos = null;
                    window.document.removeEventListener('mousemove', mousemoveEventHandler);
                    window.document.removeEventListener('mouseup', mouseupEventHandler);
                };

                handle.on('mousedown touchstart', function(event)
                {
                    that.image_selection.shapes_group.setDraggable(false);
                    that.last_mousepos = { x: event.pageX, y: event.pageY };
                    window.document.addEventListener('mousemove', mousemoveEventHandler);
                    window.document.addEventListener('mouseup', mouseupEventHandler);
                });
            };

        for (var idx = 0; idx < this.handles.length; idx++)
        {
            registerHandle(idx);
        }

        var rect = this.image_selection.getSelectionRect();
        this.image_selection.shapes_group.on('dragmove', function()
        {
            that.image_selection.setSelection({
                pos: rect.getAbsolutePosition(),
                dim: {
                    width: rect.getWidth(),
                    height: rect.getHeight()
                }
            });
        });
    },

    /**
     * The event handler for mousemove events that occur while we are in drag/resize mode,
     * after initially receiving a mousedown event for one of our resize handles.
     */
    onMouseMove: function(mousemove_event, handle_index)
    {
        var evt_pos = { x: mousemove_event.pageX, y: mousemove_event.pageY },
            selection_rect = this.image_selection.getSelectionRect(),
            selection_pos = selection_rect.getAbsolutePosition(),
            selection_width = selection_rect.getWidth(),
            selection_height = selection_rect.getHeight(),
            delta = this.calculateEventDelta(handle_index, evt_pos);

        this.image_selection.setSelection(
            this.mode.buildSelectGeometry(handle_index, delta)
        );

        this.last_mousepos = evt_pos;
    },

    /**
     * Calculates the delta-x and -y between the current and previous
     * mousemove events for the current resize/drag session.
     */
    calculateEventDelta: function(handle_index, evt_pos)
    {
        var evt_x = evt_pos.x, evt_y = evt_pos.y;
        var delta_x = evt_x - this.last_mousepos.x, 
            delta_y = evt_y - this.last_mousepos.y;
        
        var reverse_delta_x = [0, 6, 7], // for the handles on the left and the top side of the selection rectangle,
            reverse_delta_y = [0, 1, 2]; // we need to reverse the delta values.
        if (-1 !== reverse_delta_x.indexOf(handle_index))
        {
            delta_x *= -1;
        }
        if (-1 !== reverse_delta_y.indexOf(handle_index))
        {
            delta_y *= -1;
        }

        return { x: delta_x, y: delta_y };
    },

    getBoundry: function()
    {
        return this.boundry;
    },

    setMode: function(name)
    {
        if ('ratio' === name)
        {
            this.mode = new LockedRatioMode();
        }
        else
        {
            this.mode = new DefaultMode();
        }
        this.mode.init(this);
    },

    getImageSelection: function()
    {
        return this.image_selection;
    }
};

/**
 * Holds the possible directions for resizing.
 */
ResizeInteraction.DIRECTION = { 
    HORIZONTAL: 'horizontal', 
    VERTICAL: 'vertical', 
    BOTH: 'both' 
};

/**
 * Holds the different modes we support when resizing.
 * A mode basically referes to the way the mousemovement is interpretated
 * to calculate the resulting dimension and postion of the current selection.
 */
ResizeInteraction.MODE = {
    DEFAULT: 'default',
    RATIO: 'ratio'
};
