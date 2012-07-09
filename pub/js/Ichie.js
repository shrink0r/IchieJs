(function(exports, $, _) {

    // -----------------------------------------------------------------------------
    //                          Ichie
    // Ichie is a client side image editor based on canvas and the Kinetic library.
    // Besides Kinetic, undescorejs and jquery are also required.
    // In most cases you are probally allready using one of those deps and the other excuse is,
    // that the usage of underscorejs and jquery is pretty minimal so it might be factored at some point.
    // -----------------------------------------------------------------------------

    /**
     * Ichie is a client side image editor based on canvas and the Kinetic library.
     * Besides Kinetic, undescorejs and jquery are also required.
     * In most cases you are probally allready using one of those deps and the other excuse is,
     * that the usage of underscorejs and jquery is pretty minimal so it might be factored at some point.
     */
    var Ichie = function()
    {
        this.options = null;
        this.stage = null;
        this.layer = null;
        this.image = null;
        this.image_selection = null;
    };

    Ichie.prototype = {

        /**
         * Gets this instance prepared for loading an image and kicking off the editing process.
         */
        init: function(container, options)
        {
            this.options = $.extend({}, Ichie.DEFAULT_OPTIONS, options || {});
            this.image_selection = new ImageAreaSelection();
            this.layer = new Kinetic.Layer({ id: 'image-layer' });
            this.stage = new Kinetic.Stage({
              container: container,
              width: this.options.width,
              height: this.options.height
            });

            this.stage.add(this.layer);
        },

        /**
         * Loads the given image, then displays it and initializes our ImageAreaSelection.
         */
        launch: function(image_source, ready_hook)
        {
            var that = this, image = new Image();
            image.onload = function()
            {
                that.image = that.createKineticImage(image);
                that.layer.add(that.image);
                that.layer.draw();
                that.image_selection.init(that, {
                    width: that.options.width / 2,
                    height: that.options.height / 2
                });
                ready_hook();
            }
            image.src = image_source;
        },

        /**
         * Creates the Kinetic.Image instance that represents are currently loaded image.
         */ 
        createKineticImage: function(image)
        {
            var width = image.naturalWidth, height = image.naturalHeight;
            return kinecticImage = new Kinetic.Image({
                image: image,
                x: this.stage.getWidth() / 2 - (width / 2),
                y: this.stage.getHeight() / 2 - (height / 2),
                width: width,
                height: height,
                id: 'src-image'
            });
        },

        /**
         * Shows the currently image selection.
         */
        showSelection: function()
        {
            this.image_selection.show();
        },

        /**
         * Hides the currently image selection.
         */
        hideSelection: function()
        {
            this.image_selection.hide();
        },

        /**
         * Returns our Kinetic.Stage instance.
         */
        getStage: function()
        {
            return this.stage;
        },

        /**
         * Returns our Kinetic.Layer instance.
         */
        getLayer: function()
        {
            return this.layer;
        },

        /**
         * Returns our Kinetic.Image instance that represents the currently loaded/drawn image.
         */
        getImage: function()
        {
            return this.image;
        }
    };

    /**
     * A set of default options that apply when we were not given a specific value,
     * for one of our supported options.
     * Options wihtout default values are also listed here and simple have the value null.
     */
    Ichie.DEFAULT_OPTIONS = {
        width: 500,
        height: 300
    };



    // -----------------------------------------------------------------------------
    //                          ImageAreaSelection
    // Provides the ImageAreaSelection with resize behaviour and attaches 
    // mousedown, -move and -up listeners to do so.
    // The actual calculation is then delegated to the the *Mode objects (fe: DefaultMode). 
    // @see the 'Modes Section'
    // -----------------------------------------------------------------------------

    /**
     * The ImageAreaSelection allows the user to specify a rect shaped area on an image,
     * thereby providing different select modes such as centered-, symetric- or locked-ratio-selection.
     * You can query an ImageAreaSelection instance for the bounds of the current selection,
     * hide, show and reset the current selection.
     */
    var ImageAreaSelection = function()
    {
        this.ichie = null;
        this.stage = null;
        this.options = null;
        this.ratio = null;
        this.shapes_groupGroup = null;
        this.layer = null;
        this.resize_handles = null;
        this.selection_rect = null;
        this.resizeInteraction = null;
    };

    ImageAreaSelection.prototype = {

        /**
         * Sets up the gui and the ResizeInterAction that will make us resizeable.
         */
        init: function(ichie, options)
        {
            this.ichie = ichie;
            this.stage = ichie.getStage();
            this.options = $.extend({}, ImageAreaSelection.DEFAULT_OPTIONS, options || {});

            // Create our selection rectangle.
            this.selection_rect = this.createSelectionRect();
            this.ratio = this.selection_rect.getWidth() / this.selection_rect.getHeight();
            // Create our resize (drag) handles.
            this.resize_handles = this.createResizeHandles();
            // Group shapes_group together for more coding convenience.
            this.shapes_group = this.createShapesGroup();
            // Finally add the group containing the select rect and the resize-handle rects to our layer...
            this.layer = new Kinetic.Layer({
                id: 'selection-layer',
                alpha: this.options.show ? 1 : 0
            });
            this.layer.add(this.shapes_group);
            // ... and add the layer to our stage, then hope the user will engage (ryhme ryhme)
            this.stage.add(this.layer);
            // Hook up with a resize tracker so we can react to the user wanting to alter the current selection state.
            this.resizeInteraction = new ResizeInteraction();
            this.resizeInteraction.init(this);
        },

        /**
         * Creates the rect-shape that represents our current selection.
         */
        createSelectionRect: function()
        {
            return new Kinetic.Rect({
                id: 'selection-rect',
                width: this.options.width,
                height: this.options.height,
                fill: "rgba(0, 0, 0, 0)",
                stroke: "white",
                strokeWidth: this.options.stroke,
                x: 0,
                y: 0
            });
        },

        /**
         * Creates our resize handles according to the definitions in ImageAreaSelection.HANDLES.
         */
        createResizeHandles: function()
        {
            var that = this, 
                resize_handles = [], 
                coord_map = this.calculateResizeHandleCoordMap();

            _.each(ImageAreaSelection.HANDLES, function(handle_def)
            {
                resize_handles.push(
                    that.createResizeHandle(handle_def, coord_map)
                );
            });

            return resize_handles;
        },

        /**
         * Creates a rect shape that represents the resize handle,
         * as described by the passed handle_def.
         */
        createResizeHandle: function(handle_def, coord_map)
        {
            return new Kinetic.Rect({
                width: this.options.size,
                height: this.options.size,
                fill: this.options.fill,
                stroke: this.options.stroke,
                strokeWidth: this.options.stroke_width - 1, // always create a small contrast between resize handles and rect stroke
                x: coord_map[handle_def.x], 
                y: coord_map[handle_def.y]
            });
        },

        /**
         * Calculates coordinates that are used to position our resize handle shapes
         * along the border of our selection rect.
         * The keys of the returned object map to the 'x' and 'y' values 
         * of a handle definition inside the ImageAreaSelection.HANDLES array.
         */
        calculateResizeHandleCoordMap: function()
        {
            return {
                north: -1 * (this.options.size / 2),
                east: this.selection_rect.getWidth() - (this.options.size / 2),
                south: this.selection_rect.getHeight() - (this.options.size / 2),
                west: -1 * (this.options.size / 2),
                center: (this.selection_rect.getWidth() / 2) - (this.options.size / 2),
                middle: (this.selection_rect.getHeight() / 2) - (this.options.size / 2)
            };
        },

        /**
         * Creates a Kinetic.Group that holds all our shapes (select rect and resize handle rects).
         * The created group is also the handler of our exposed drag behaviour.
         */
        createShapesGroup: function()
        {
            var shapes_group = new Kinetic.Group({
                draggable: true,
                x: (this.stage.getWidth() / 2) - (this.options.width / 2), // center the shapes_group on stage
                y: (this.stage.getHeight() / 2) - (this.options.height / 2)
            });
            
            shapes_group.setDragBounds(
                this.calculateDragBounds() // lock the "shapes_group" to our image's dimensions
            );
            shapes_group.add(this.selection_rect);

            _.each(this.resize_handles, function(handle) { shapes_group.add(handle); });

            return shapes_group;
        },

        /**
         * Calculates the bounds of the image which is currently loaded
         * by the Ichie instance that we are bound to.
         */
        calculateDragBounds: function()
        {
            var img = this.ichie.getImage(), 
                pos = img.getAbsolutePosition();

            return {
                top: pos.y,
                left: pos.x,
                right: pos.x + img.getWidth() - this.selection_rect.getWidth(),
                bottom: pos.y + img.getHeight() - this.selection_rect.getHeight()
            };
        },

        /**
         * After the position or dimensions of the selection rect have changed,
         * we need to get our resize handles back on the track.
         */
        correctResizeHandlePositions: function()
        {
            var that = this, 
                idx = 0,
                coord_map = this.calculateResizeHandleCoordMap();

            _.each(ImageAreaSelection.HANDLES, function(handle_def)
            {
                var handle = that.resize_handles[idx++];
                handle.setX(coord_map[handle_def.x]);
                handle.setY(coord_map[handle_def.y]);
            });
        },

        /**
         * Returns the bounds (top, right, bottom, left) of the image area,
         * that is currently selected.
         * The coords returned are relative to the image's current position.
         */ 
        getSelection: function()
        {
            var select_pos = this.selection_rect.getAbsolutePosition(),
                img_pos = this.ichie.getImage().getAbsolutePosition(),
                select_x = select_pos.x - img_pos.x,
                select_y = select_pos.y - img_pos.y;

            return {
                top: select_y,
                right: select_x + this.selection_rect.getWidth(),
                bottom: select_y + this.selection_rect.getHeight(),
                left: select_x
            };
        },

        /**
         * Sets the selection rect's pos and dimenions.
         * This method triggers a redraw with a former repositioning of our handles.
         */
        setSelection: function(selection)
        {
            this.selection_rect.setWidth(selection.dim.width);
            this.selection_rect.setHeight(selection.dim.height);

            this.shapes_group.setX(selection.pos.x);
            this.shapes_group.setY(selection.pos.y);
            this.shapes_group.setDragBounds(this.calculateDragBounds());

            this.correctResizeHandlePositions();

            this.layer.draw();
        },

        /**
         * Returns an array with our current handles (Kinetic.Rect).
         * This method returns a new array and not the instance actually used by the select rect.
         */
        getHandles: function(idx)
        {
            return $.merge([], this.resize_handles);
        },

        /**
         * Returns our selection rect (Kinetic.Rect) instance.
         */
        getSelectionRect: function()
        {
            return this.selection_rect;
        },

        /**
         * Returns our layer (Kinetic.Layer) instance.
         */
        getLayer: function()
        {
            return this.layer;
        },

        /**
         * Shows the selection stuff to the user.
         */
        show: function()
        {
            this.layer.setAlpha(1);
            this.layer.draw();
        },

        /**
         * Hides the selection stuff from the user.
         */
        hide: function()
        {
            this.layer.setAlpha(0);
            this.layer.draw();
        }
    };

    /**
     * An array holding an object defines a resize handle (id and position).
     * The 'x' and 'y' values of a handle definition are expanded to concrete coords 
     * by our calculateResizeHandleCoordMap method.
     *
     * @notice The order is important as we want to be able to calc the opposite side
     * handle of a given handle by adding 4 to the give index.
     */
    ImageAreaSelection.HANDLES = [
        { x: 'west', y: 'north' }, // northWest
        { x: 'center', y: 'north' }, // north
        { x: 'east', y: 'north' }, // northEast
        { x: 'east', y: 'middle' }, // east
        { x: 'east', y: 'south' }, // southEast
        { x: 'center', y: 'south' }, // south
        { x: 'west', y: 'south' }, // southWest
        { x: 'west', y: 'middle' } // west
    ];

    /**
     * Holds the default options that we are initialized with,
     * if no specific value is found inside the provided external options 'hash'.
     * Options wihtout default values are also listed here and simple have the value null.
     */
    ImageAreaSelection.DEFAULT_OPTIONS = {
        size: 7,
        fill: "rgba(23, 23, 223, 1)",
        show: false,
        stroke: "white",
        stroke_width: 2,
        keep_ratio: false
    };



    // -----------------------------------------------------------------------------
    //                          ResizeInterAction
    // Provides the ImageAreaSelection with resize behaviour and attaches 
    // mousedown, -move and -up listeners to do so.
    // The actual calculation is then delegated to the the *Mode objects (fe: DefaultMode). 
    // @see the 'Modes Section'
    // -----------------------------------------------------------------------------

    /**
     * The ResizeInteraction allows the user to resize a given ImageAreaSelection,
     * by dragging one of the ImageAreaSelection's resize handles.
     */
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
            this.boundry = this.calculateBoundry();
            this.mode = new LockedRatioMode();
            this.mode.init(this);
            this.last_mousepos = null;
            this.registerHandleEvents();
        },

        calculateBoundry: function()
        {
            var ichie = this.image_selection.ichie,
                img = ichie.getImage(),
                img_pos = img.getAbsolutePosition();

            return {
                top: img_pos.y,
                right: img_pos.x + img.getWidth(),
                bottom: img_pos.y + img.getHeight(),
                left: img_pos.x
            };
        },

        /**
         * Registers mousedown, mousemove and mouseup events together with their corresponding touch events.
         * Makes sure that the mousemove handler is only active as long as the resize/drag mode is too.
         */
        registerHandleEvents: function()
        {
            for (var that = this, idx = 0; idx < this.handles.length; idx++)(function(index)
            {
                var handle = that.handles[index];
                var mousemoveEventHandler = function(event){ that.onMouseMove(event, index); };
                var mouseupEventHandler = function(event){ 
                    that.image_selection.shapes_group.setDraggable(true);
                    that.last_mousepos = null,
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
            })(idx);
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
                this.mode.apply(handle_index, delta)
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

        getImageSelection: function()
        {
            return this.image_selection;
        }
    }

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
        apply: function(handle_index, delta)
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
            var image_selection = this.interaction.getImageSelection();

            // Setup vars required for calculation.
            var selection_rect = image_selection.getSelectionRect(),
                width = selection_rect.getWidth(),
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


    /**
     * Implements the logic for the 'locked-ratio' resize mode,
     * allowing the user to resize in all directions thereby keeping the selection's ratio.
     */
    var LockedRatioMode = function()
    {
        DefaultMode.prototype.apply.constructor.call(this);
    };
    LockedRatioMode.prototype = new DefaultMode();
    LockedRatioMode.prototype.constructor = LockedRatioMode;

    /**
     * Get the rect resize/reposition calcultions done for 'locked-ration' selections.
     */
    LockedRatioMode.prototype.apply = function(handle_index, delta)
    {
        var selection = DefaultMode.prototype.apply.call(this, handle_index, delta); // luke, I am your father!

        var image_selection = this.interaction.getImageSelection(),
            dir = ResizeInteraction.DIRECTION,
            direction = this.determineResizeDirection(handle_index, delta),
            dimensions = selection.dim,
            position = selection.pos,
            selection_rect = image_selection.getSelectionRect(),
            selection_pos = selection_rect.getAbsolutePosition();

        var reposition_x = [0, 6], reposition_y = [0, 2];
        if (direction === dir.HORIZONTAL)
        {
            var new_height = dimensions.width / image_selection.ratio;
            if (-1 !== reposition_y.indexOf(handle_index))
            {
                position.y = selection_pos.y - (new_height - selection_rect.getHeight());
            }
            dimensions.height = new_height;
        }
        else
        {
            var new_width = dimensions.height * image_selection.ratio;
            if (-1 !== reposition_x.indexOf(handle_index))
            {
                position.x = selection_pos.x - (new_width - selection_rect.getWidth());
            }
            dimensions.width = new_width;
        }
        return { pos: position, dim: dimensions };
    };

    /**
     * Determines which direction the next resize should take.
     * Returns one of the ResizeInteraction.DIRECTION.* 'constants'.
     */
    LockedRatioMode.prototype.determineResizeDirection = function(handle_index, delta)
    {
        var dir = ResizeInteraction.DIRECTION, 
            direction = DefaultMode.prototype.determineResizeDirection.call(this, handle_index, delta); // oh hai dad

        // The ratio mode only supports one modification direction at a time.
        if (dir.BOTH === direction)
        {
            direction = (Math.abs(delta.x) < Math.abs(delta.y)) ? dir.VERTICAL : dir.HORIZONTAL;
        }
        return direction;
    };



    // -----------------------------------------------------------------------------
    //                          EXPORTS SECTION
    // In this section you'll find all the methods/properties, that we expose.
    // -----------------------------------------------------------------------------

    exports.IchieJs = { 
        /**
         * Takes a DOMElement that will serve as the container for Ichie's stage
         * and returns a fresh and initialized Ichie instance.
         */
        create: function(container) 
        {
            var ichie = new Ichie(); 
            ichie.init(container);
            return ichie;
        }
    };

})(window, $, _);
