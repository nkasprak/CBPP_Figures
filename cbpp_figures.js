/*globals Typekit, CBPP*/
(function() {
    "use strict";
    if (typeof(CBPP.Figures)!=="undefined") {
        return;
    }
    CBPP.TypekitRequested = false;
    CBPP.Figures = {};
    CBPP.Figures.ready = false;

    /*load dependencies*/    
    CBPP.Figures.load = function(callback, typekitCallback) {
        CBPP.Figures.urlBase = CBPP.urlBase + "CBPP_Figures/v" + CBPP.Figures.version + "/";
        var thisFigureLoaded = false;
        var urlBase = CBPP.Figures.urlBase, cssLoaded = false;
        var l = document.createElement("link");
        l.type="text/css";
        l.rel="stylesheet";
        l.href =  urlBase + 'cbpp_figures.css';
        function loadCSS() {
            if (!cssLoaded) {
                cssLoaded = true;
                ready();
            }
        }
        l.onload = loadCSS;
        l.load = loadCSS;
        document.getElementsByTagName('head')[0].appendChild(l);
        function ready() {
            if (cssLoaded && !thisFigureLoaded) {
                CBPP.Figures.ready = true;
                callback();
                thisFigureLoaded = true;
            }
        }
        if (CBPP.TypekitRequested === false) {
            CBPP.TypekitRequested = true;   
            $.getScript("//use.typekit.net/qcf4pql.js", function() {
                try{Typekit.load({
                    active: function() {
                        if (typeof(typekitCallback)==="function") {
                            typekitCallback();
                        }
                    }
                });}catch(e){} 
            });
        }
        /*fallback in case browser doesn't support CSS onload*/
        setTimeout(loadCSS,1000);
    };
    
    CBPP.Figures.Figure = function(id, config) {
        if (CBPP.Figures.ready === false) {
            console.error("Error: CBPP Figures library not loaded yet.");
            return false;
        }     
        this.id = id;
        this.applyConfig(config);
        this.build();
    };
    CBPP.Figures.Figure.prototype = {
        title : "Title",
    	subtitle : "Subtitle",
    	notes : "<p>Note: Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p><p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>",
    	credit : "Center on Budget and Policy Priorities | <a href=\"http://www.cbpp.org\">cbpp.org</a>",
    	contentAspectRatio : 0.5625,
        layout: "fixed",
        columns: [1],
        rows: [1]
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
    CBPP.Figures.Figure.prototype.build = function () {
        var s = $("#" + this.id),
            title = $("<h2 class=\"title\">"),
            subtitle = $("<h3 class=\"subtitle\">"),
            contentWrap = $("<div class=\"contentWrap\">"),
            notes = $("<div class=\"notes\">"),
            credit = $("<div class=\"credit\">"),
            borderWrap = $("<div class=\"borderWrapper\">"),
            content = $("<div class=\"content\">"),
            fixedCell;
        var x,y,gridWidth=0,gridHeight=0,width = this.columns.length, cell,height=this.rows.length;
        if (this.layout==="fixed") {
            contentWrap.css("padding-bottom",this.contentAspectRatio*100 + "%");
            for (y = 0; y<height; y++) {
                gridHeight += this.rows[y];
            }
            for (x = 0; x<width; x++) {
                gridWidth += this.columns[x];
            }
            for (y = 0; y<height; y++) {
                for (x = 0; x<width; x++) {
                    cell = $("<div class=\"grid grid" + x + "" + y + "\">");
                    cell.css("width",this.columns[x]/gridWidth*100 + "%");
                    cell.css("height",this.rows[y]/gridHeight*100 + "%");
                    content.append(cell);
                }
            }
        } else if (this.layout==="variable") {
            contentWrap.css("position","relative");
            contentWrap.css("height","auto");
            contentWrap.css("padding-bottom","0");
            content.css("position","relative");
            for (x = 0; x<width; x++) {
                gridWidth += this.columns[x];
            }
            for (y = 0; y<height; y++) {
                for (x = 0; x<width; x++) {
                    cell = $("<div class=\"grid grid" + x + "" + y + "\">");
                    cell.css("width",this.columns[x]/gridWidth*100 + "%");
                    if (this.rows[y]!==0) {
                        cell.css("height",0);
                        cell.css("position","relative");
                        cell.css("padding-bottom",this.rows[y]*100 + "%");
                        fixedCell = $("<div class='fixedCell'>");
                        cell.append(fixedCell);
                    } else {
                        cell.css("height","auto");
                    }
                    content.append(cell);
                }
            }
        }
        title.html(this.title);
        subtitle.html(this.subtitle);
        notes.html(this.notes);
        credit.html(this.credit);
        contentWrap.append(content);
        s.empty();
        s.removeClass("cbppFigure");
        s.addClass("cbppFigure");
        borderWrap.append(title);
        borderWrap.append(subtitle);
        borderWrap.append(contentWrap);
        borderWrap.append(notes);
        s.append(borderWrap);
        s.append(credit);
    };
})();
