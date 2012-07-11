/*global Ichie:false, exports:false*/

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
