/*global ResizeInteraction:false*/

// -----------------------------------------------------------------------------
//                       *Modes (DefaultMode and family)
// The different modes, that are available to the ResizeInteraction.
// A mode's task is calculate the new dimensions and position for the ResizeInteraction
// during the processing of mousemove events.
// To do so, a mode is passed the index of the originating resize-handle and the 
// delta between the current and the last mousemove event.
// -----------------------------------------------------------------------------

/**
 * Implements the logic for the 'default' resize mode,
 * allowing the user to resize in all directions without any constraints.
 */
var DefaultMode = function()
{
    this.interaction = null;
};

DefaultMode.prototype = {

    init: function(interaction)
    {
        this.interaction = interaction;
    },

    /**
     * Get the rect resize/reposition calcultions done for 'default' selections.
     */
    buildSelectGeometry: function(handle_index, delta)
    {
        return this.clipSelectionToBoundry({
            pos: this.calculateSelectPostion(handle_index, delta),
            dim: this.calculateSelectDimensions(handle_index, delta)
        });
    },

     /**
     * Calulates the dimensions of our ImageAreaSelection's selection
     * after processing the given the given delta_x and delta_y values.
     */
    calculateSelectDimensions: function(handle_index, delta)
    {
        var image_selection = this.interaction.getImageSelection(),
            selection_rect = image_selection.getSelectionRect();

        var width = selection_rect.getWidth(),
            height = selection_rect.getHeight();

        var dir = ResizeInteraction.DIRECTION,
            direction = this.determineResizeDirection(handle_index, delta);

        width += (direction === dir.HORIZONTAL || direction === dir.BOTH) ? delta.x : 0;
        height += (direction === dir.VERTICAL || direction === dir.BOTH) ? delta.y : 0;

        return { width: width, height: height };
    },

    /**
     * Determines which direction the next resize should take.
     * Returns one of the ResizeInteraction.DIRECTION.* 'constants'.
     */
    determineResizeDirection: function(handle_index, delta)
    {
        var dir = ResizeInteraction.DIRECTION, 
            direction = null;

        var handle_map = {};
            handle_map[dir.HORIZONTAL] = [3, 7];
            handle_map[dir.VERTICAL] = [1, 5];
            handle_map[dir.BOTH] = [0, 2, 4, 6];

        _.each(handle_map, function(handle_indexes, handle_direction)
        {
            if (-1 !== handle_indexes.indexOf(handle_index))
            {
                direction = handle_direction;
            }
        });

        return direction;
    },

    /**
     * Calculates the new position of our ImageAreaSelection after resizing.
     */
    calculateSelectPostion: function(handle_index, delta)
    {
        var image_selection = this.interaction.getImageSelection(),
            selection_rect = image_selection.getSelectionRect(),
            selection_pos = selection_rect.getAbsolutePosition(),
            select_x = selection_pos.x, 
            select_y = selection_pos.y;

        var reposition_x = [0, 6, 7], reposition_y = [0, 1, 2];
        select_x -= (-1 !== reposition_x.indexOf(handle_index)) ? delta.x : 0;
        select_y -= (-1 !== reposition_y.indexOf(handle_index)) ? delta.y : 0;

        return { x: select_x, y: select_y };
    },

    /**
     * Make sure that our selected area never exceeds
     * the currently loaded image's dimensions.
     */
    clipSelectionToBoundry: function(selection)
    {
        var image_selection = this.interaction.getImageSelection(),
            boundry = this.interaction.getBoundry(),
            new_pos = selection.pos,
            new_dim = selection.dim,
            selection_rect = image_selection.getSelectionRect(),
            cur_pos = selection_rect.getAbsolutePosition();

        var new_bounds = {
            top: new_pos.y,
            right: new_pos.x + new_dim.width,
            bottom: new_pos.y + new_dim.height,
            left: new_pos.x
        };
        var cur_dim = {
            width: selection_rect.getWidth(),
            height: selection_rect.getHeight()
        };

        if (new_bounds.left < boundry.left)
        {
            new_pos.x = boundry.left;
            new_dim.width = cur_dim.width + (cur_pos.x - new_pos.x);
        }
        if (new_bounds.right > boundry.right)
        {
            new_dim.width = boundry.right - new_pos.x;
        }
        if (new_bounds.top < boundry.top)
        {
            new_pos.y = boundry.top;
            new_dim.height = cur_dim.height + (cur_pos.y - new_pos.y);
        }
        if (new_bounds.bottom > boundry.bottom)
        {
            new_dim.height = boundry.bottom - new_pos.y;
        }
        return { pos: new_pos, dim: new_dim };
    }
};
