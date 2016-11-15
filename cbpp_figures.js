/*globals Typekit, CBPP*/
(function() {
    "use strict";

    /*polyfill for IE8*/
    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function(elt /*, from*/) {
            var len = this.length >>> 0;
            var from = Number(arguments[1]) || 0;
            from = (from < 0)
                ? Math.ceil(from)
                : Math.floor(from);
            if (from < 0)
            from += len;

            for (; from < len; from++)
            {
            if (from in this &&
                this[from] === elt)
                return from;
            }
            return -1;
        };
    }

    if (typeof(CBPP.Figures)!=="undefined") {
        return;
    }
    CBPP.TypekitRequested = false;
    CBPP.Figures = {};
    CBPP.Figures.ready = false;

    /*load dependencies*/    
    CBPP.Figures.load = function(callback) {
        CBPP.Figures.urlBase = CBPP.urlBase + "CBPP_Figures/v" + CBPP.Figures.version + "/";
        var thisFigureLoaded = false;
        var CBPP_URL_ROOT = CBPP.Figures.urlBase, cssLoaded = false, typekitLoaded = false;
        function loadCSS() {
            if (!cssLoaded) {
                cssLoaded = true;
                ready();
            }
        }
        CBPP.CSS(CBPP_URL_ROOT + "cbpp_figures.css", loadCSS);
        function ready() {
            if (cssLoaded && !thisFigureLoaded && typekitLoaded) {
                CBPP.Figures.ready = true;
                callback();
                thisFigureLoaded = true;
            }
        }
        if (CBPP.TypekitRequested === false) {
            CBPP.TypekitRequested = true;   
            $.getScript("//use.typekit.net/qcf4pql.js", function() {
                try{Typekit.load({
                    active: function() {typekitLoaded = true; clearTimeout(tkb); ready();}
                });}catch(e){} 
            });
        }
        /*fallback in case browser doesn't support CSS onload*/
        setTimeout(loadCSS,1000);

        /*fallback in case Typekit fails*/
        var tkb = setTimeout(function() {
            console.log("typekit error");
            typekitLoaded = true;
            ready();
        },800);
    };
    
    CBPP.Figures.Figure = function(selector, config) {
        if (CBPP.Figures.ready === false) {
            console.error("Error: CBPP Figures library not loaded yet.");
            return false;
        }     
        this.selector = selector;
        this.applyConfig(config);
        this.build();
    };
    CBPP.Figures.Figure.prototype = {
        title : "Title",
    	subtitle : "Subtitle",
    	notes : "<p>Note: Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p><p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>",
    	credit : "Center on Budget and Policy Priorities | <a href=\"http://www.cbpp.org\">cbpp.org</a>",
        layout: "fixed",
        columns: [1],
        rows: [0.5625],
        cssImportant: true,
        collapseWidth: 0,
        collapseColumns:[],
        mergeRows: [],
        mergeColumns: [],
        breakpoint: 650,
        variableCellsOnBreak: []
    };
    CBPP.Figures.Figure.prototype.applyConfig = function(config) {
        var newConfig = {};
        $.extend(true, newConfig, config);
        for (var item in newConfig) {
            if (config.hasOwnProperty(item)) {
                this[item] = newConfig[item];
            }
        }
    };
    CBPP.Figures.Figure.prototype.getConfig = function() {
        return {
            title: this.title,
            subtitle: this.subtitle,
            notes: this.notes    
        };
    };
    CBPP.Figures.Figure.prototype.assign = function(srcSelect,x,y) {
        var destSelect = this.selector + " .grid" + x + y;
        $(destSelect).empty();
        $(srcSelect).detach().appendTo(destSelect);
    };
    CBPP.Figures.Figure.prototype.build = function () {
        var s = $(this.selector),
            title = $("<h2 class=\"title\"></h2>"),
            subtitle = $("<h3 class=\"subtitle\"></h3>"),
            notes = $("<div class=\"notes\"></div>"),
            credit = $("<div class=\"credit\"></div>"),
            borderWrap = $("<div class=\"borderWrapper\"></div>"),
            content = $("<div class=\"content\"></div>"),
            style = "",
            cellWrap,
            cellWidth,
            cellPadding,
            cellsToSkip = [],
            columnsToSkip = [],
            mergedSize,
            beforeBreak,
            afterBreak,
            f = this;
        if (typeof(this.responsiveBreak)==='undefined') {
            this.responsiveBreak = Math.max(0,this.columns.length - 1);
        }
        function mergedCellSize() {
            var width = -1, height = -1;
            var cols = f.mergeColumns[y];
            var rows = f.mergeRows[x];
            var numRows = 0;
            var j;
            if (typeof(cols)!=="undefined") {
                if (x >= cols[0] && x < cols[1]) {
                    width = 0;
                    for (j = cols[0];j<=cols[1];j++) {
                        width += f.columns[j]/gridWidth*100;
                        if (j !== cols[0]) {
                            columnsToSkip.push(j);
                        }
                    }
                }
            }
            if (typeof(rows)!=="undefined") {
                if (y >= rows[0] && y < rows[1]) {
                    height = 0;
                    for (j = rows[0];j<=rows[1];j++) {
                        height += f.rows[j]*100;
                        if (j !== rows[0]) {
                            cellsToSkip.push([x,j]);
                        }
                    }
                    numRows = rows[1] - rows[0];
                }
            }
            return {
                numRows: numRows,
                width:width,
                height:height
            };
        }
        function arrayHasVector(container, searchFor) {
            for (var i = 0, ii = container.length; i<ii; i++) {
                if (container[i][0] === searchFor[0] && container[i][1] === searchFor[1]) {
                    return i;
                }
            }
            return -1;
        }
        var x,y,gridWidth=0,width = this.columns.length, cell,height=this.rows.length, beforeWidth = 0, afterWidth = 0, breakVariable;
        for (x = 0; x<width; x++) {
            gridWidth += this.columns[x];
            if (x < this.responsiveBreak) {
                beforeWidth += this.columns[x];
            } else {
                afterWidth += this.columns[x];
            }
        }
        if (beforeWidth > 0) {beforeWidth = gridWidth / beforeWidth;}
        if (afterWidth > 0) {afterWidth = gridWidth / afterWidth;}
        for (y = 0; y<height; y++) {
            beforeBreak = $("<div class='beforeBreak'></div>");
            afterBreak = $("<div class='afterBreak'></div>");
            
            for (x = 0; x<width; x++) {
                while (columnsToSkip.indexOf(x)!==-1) {
                    columnsToSkip.splice(columnsToSkip.indexOf(x),1);
                    x++;
                }
                while (arrayHasVector(cellsToSkip,[x,y])!==-1) {
                    cellsToSkip.splice(arrayHasVector(cellsToSkip,[x,y]),1);
                    x++;
                }
                if (x<width) {
                    breakVariable = false;
                    if (arrayHasVector(this.variableCellsOnBreak,[x,y])!==-1) {
                        breakVariable = true;
                    }
                    cellWrap = $("<div class=\"cellWrap cellWrap" + x + "" + y + (typeof(this.rows[y])==="number" ? " fixed" : "") + (breakVariable? " breakVariable" : "") + "\"></div>");
                    
                    cell = $("<div class=\"grid grid" + x + "" + y + "\">");
                    cellWidth = this.columns[x]/gridWidth*100;
                    if (typeof(this.rows[y])==="number") {
                        cellPadding = this.rows[y]*100;
                    }
                    mergedSize = mergedCellSize();
                    if (mergedSize.width!==-1) {
                        cellWidth = mergedSize.width;
                    }
                    if (mergedSize.height!==-1) {
                        cellPadding = mergedSize.height;
                    }
                    style += this.selector + " .cellWrap" + x + "" + y + " {width: " + cellWidth + "%" + (this.cssImportant? " !important" : "") + ";" + (typeof(this.rows[y])==="number" ? "padding-bottom: " + cellPadding + "%;": "") + "}";
                    cell.append("<table class=\"gridBox\"><tr><td class=\"gridLabel\">" + ".grid" + x + "" + y + "</td></tr></table>");
                    cellWrap.append(cell);
                    if (x < this.responsiveBreak) {
                        beforeBreak.append(cellWrap);
                    } else {
                        afterBreak.append(cellWrap);
                    }
                }
            }
            
            content.append(beforeBreak);
            content.append(afterBreak);
        }

        style += "@media (max-width:" + this.breakpoint + "px) {" + this.selector + " .afterBreak {clear:both;width:" + afterWidth*100 + "% !important;}" + this.selector + " .beforeBreak {clear:both;width:"+ beforeWidth*100 + "% !important;}" + this.selector + " .cellWrap.breakVariable{padding-bottom:0;}" + this.selector + " .cellWrap.breakVariable .grid{position:relative;}}";
        
        title.html(this.title);
        subtitle.html(this.subtitle);
        notes.html(this.notes);
        if ($(notes).children("p").length === 0) {
            $(notes).wrapInner("<p></p>");
        }
        credit.html(this.credit);
        
        s.empty();
        s.removeClass("cbppFigure");
        s.addClass("cbppFigure");
        borderWrap.append(title);
        borderWrap.append(subtitle);
        borderWrap.append(content);
        borderWrap.append(notes);
        s.append(borderWrap);
        s.append(credit);
        $(document).find("head").prepend("<style type='text/css'>" + style + "</style");
    };
})();
