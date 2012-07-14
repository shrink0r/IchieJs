/*global ImageFilters: false, ImageAreaSelection:false*/
var MainDisplay = function()
{
    this.stage = null;
    this.layer = null;
    this.image = null;
    this.scale_x = 1;
    this.scale_y = 1;
    this.image_selection = null;
    this.image_boundry = null;
};

MainDisplay.prototype = {

    init: function(options)
    {
        this.options = $.extend({}, MainDisplay.DEFAULT_OPTIONS, options || {});
        this.options.container = $(this.options.container).first();

        this.stage = new Kinetic.Stage({
            width: this.options.width,
            height: this.options.height,
            container: this.options.container[0]
        });

        this.layer = new Kinetic.Layer({ id: 'image-layer' });
        this.image = new Kinetic.Image({ id: 'preview-image' });
        this.layer.add(this.image);
        this.stage.add(this.layer);

        this.image_selection = new ImageAreaSelection();
        this.image_selection.init(this, {
            stage: this.stage,
            width: options.select_width || this.stage.getWidth(),
            height: options.select_height || this.stage.getHeight(),
            onchanged: this.onSelectionChanged.bind(this)
        });

        var that = this;
        $(this.stage.getDOM()).mousewheel(function(event, delta, deltaX, deltaY)
        {
            var ratio = that.image.getWidth() / that.image.getHeight(),
                new_height = that.image.getHeight() + deltaY;
            that.image.setHeight(new_height);
            that.image.setWidth(new_height * ratio);
            that.layer.draw();
            return false;
        });
    },

    onSelectionChanged: function(selection)
    {
        var image_dim = this.clipDimensions({
            x: this.image.getX(),
            y: this.image.getY(),
            height: this.image.getHeight(), 
            width: this.image.getWidth()
        }); // make sure are drag bounds are never greater than our stage's (canvas) bounds.
        this.image_selection.setDragBounds({
            top: image_dim.y,
            right: image_dim.width + image_dim.x - selection.dim.width,
            bottom: image_dim.height + image_dim.y - selection.dim.height,
            left: image_dim.x
        });
    },

    setImage: function(image, adopt)
    {
        this.image.setImage(image);

        if (true === adopt)
        {
            this.adjustImageDimensions(image);
        }

        this.layer.draw();
    },

    adjustImageDimensions: function(image)
    {
        var width = image.naturalWidth,
            height = image.naturalHeight,
            ratio = width / height,
            stg_width = this.stage.getWidth(),
            stg_height = this.stage.getHeight();
        if (1 >= ratio && stg_width < width)
        {
            this.scale_x = width / stg_width;
            width = stg_width;
            var new_height = width / ratio;
            this.scale_y = height / new_height;
            height = new_height;
        }
        else if (stg_height < height)
        {
            this.scale_y = height / stg_height;
            height = stg_height;
            var new_width = height * ratio;
            this.scale_x = width / new_width;
            width = new_width;
        }
        this.image.setHeight(height);
        this.image.setWidth(width);

        var x = stg_width / 2 - (width / 2),
            y = stg_height / 2 - (height / 2);
        this.image.setX(x);
        this.image.setY(y);

        this.image_boundry = {
            top: Math.floor(y),
            right: Math.ceil(x + width),
            bottom: Math.ceil(y + height),
            left: Math.floor(x)
        };

        this.image_selection.setSelection({
            dim : { width : this.image.getWidth(), height: this.image.getHeight() },
            pos: { x: this.image.getX(), y: this.image.getY() }
        });
    },

    clipDimensions: function(dimensions)
    {
        var stg_width = this.stage.getWidth(),
            stg_height = this.stage.getHeight(),
            ratio = dimensions.width / dimensions.height,
            width, height, x, y;

        if (1 < ratio)
        {
            height = dimensions.height > stg_height ? stg_height : dimensions.height;
            width = height * ratio;
        }
        else
        {
            width = dimensions.width > stg_width ? stg_width : dimensions.width;
            height = width / ratio;
        }

        if (0 > dimensions.x)
        {
            x = 0;
        }
        else if(stg_width < dimensions.x + width)
        {
            x = stg_width;
        }
        else
        {
            x = dimensions.x;
        }

        if (0 > dimensions.y)
        {
            y = 0;
        }
        else if(stg_height < dimensions.y + height)
        {
            y = stg_height;
        }
        else
        {
            y = dimensions.y;
        }

        return { x: x, y: y, width: width, height: height };
    },

    scaleDimensions: function(dimensions)
    {
        return {
            top: dimensions.top * this.scale_y,
            right: dimensions.right * this.scale_x,
            bottom: dimensions.bottom * this.scale_y,
            left: dimensions.left * this.scale_x
        };
    },

    showSelection: function()
    {
        this.image_selection.show();
    },

    hideSelection: function()
    {
        this.image_selection.hide();
    },

    getCurrentSelection: function()
    {
        var relative_to = this.image.getAbsolutePosition();
        return this.scaleDimensions(
            this.image_selection.getSelection(relative_to)
        );
    },

    setSelectMode: function(name)
    {
        this.image_selection.setResizeMode(name);
    },

    getStage: function()
    {
        return this.stage;
    },

    getLayer: function()
    {
        return this.layer;
    },

    getImage: function()
    {
        return this.image;
    },

    getImageBoundry: function()
    {
        return this.image_boundry;
    },

    getDOM: function()
    {
        return this.stage.getDOM();
    }
};


MainDisplay.DEFAULT_OPTIONS = {
    width: 400,
    height: 300
};