var TabsView = (function () {

    /**
     * [TabsView description]
     * @constructor
     * @param {string} containerId
     * @param {object} options
     */
  	var TabsView = function(containerId, options) {
    	this.options = options || {};
    	this.containerId = containerId;
    	this.tabs = [];
        this.activeTab = {};
    
	  	this._init();
  	}

    /**
     * _init Calls internal methods to create tabs
     * @private
     */
    TabsView.prototype._init = function() {
        this._setContainer();
        this._hideDivs();
        this._createTabs();
        this._restoreCurrentState();
    }

    /**
     * _createTabs Creates tabs
     * @private
     */
    TabsView.prototype._createTabs = function() {
        if (this.options.tabs && this.options.tabs.length > 0) {
            var divToAdd;

            this.tabsList = this._createElm("ul", {id: this.containerId + "-tabs-list"}, "", "");
            
            var tabsContainer = this._createElm("div", {id: this.containerId + "-tabs", class: 'tabs'}, "", "");
            
            this.tabsContent = this._createElm("div", {id: this.containerId + "-tabscontent", class: 'tabscontent'}, "", "");

            this.options.tabs.forEach(function(element, index, array) {
                this.addTab(element, index, this.tabsList, this.tabsContent);
            }, this);

            this.tabsList.setAttribute("data-active", this.activeTab.num);
            this.tabsList.setAttribute("data-div", this.activeTab.id);
            
            tabsContainer.appendChild(this.tabsList);
            this.container.appendChild(tabsContainer);
            this.container.appendChild(this.tabsContent);
        }
    }

    /**
     * _createContentDiv Creates container for tabs content
     * @private
     * @param  {object} tab
     * @return {HTMLElement} contentDiv
     */
    TabsView.prototype._createContentDiv = function(tab) {
        var contentDiv = this._getById(tab.id);

        if (contentDiv) {
            contentDiv.className = tab.active ? 'show' : 'hide';
        } else {
            var attr = {
                class: tab.active ? 'show' : 'hide',
                id: tab.id
            };
        
            contentDiv = this._createElm("div", attr, tab.content, "");
        }

        return contentDiv;
    }
    
    /**
     * _hideDivs Hides existing divs with tabs content
     * @private
     */
    TabsView.prototype._hideDivs = function() {
        var divs = this.container.childNodes,
            length = divs.length;

        if (length > 0) {
            for (var i = 0; i < length; i++) {
                if (divs[i].nodeType == 1) {
                    divs[i].className = "hide";
                }
            }
        }
    }

    /**
     * _setContainer Initialized tabs container
     * @private
     */
    TabsView.prototype._setContainer = function() {
        var container = this._getById(this.containerId);

        if (container) {
            this.container = container;
        }
        else {
            this.container = this._createContainer();
        }
    }

    /**
     * _createContainer Creates new container
     * @private
     * @return {HTMLElement}
     */
    TabsView.prototype._createContainer = function() {
        var containerOptions = {
            'id' : this.containerId,
            'class' : 'tabContainer'
        };

        return this._createElm('div', containerOptions, '', document.body);
    }

    /**
     * _getById Alias for document.getElementById
     * @private
     * @param  {string} id
     * @return {HTMLElement}
     */
    TabsView.prototype._getById = function(id) {
        return document.getElementById(id);
    }

    /**
     * _createElm Creates html elements
     * @private
     * @param  {string} type Type of html element
     * @param  {object} attr List of html attributes
     * @param  {string} content Content of html element
     * @param  {HTMLElement} parent Parent element for the created one
     * @return {HTMLElement}
     */
    TabsView.prototype._createElm = function(type, attr, content, parent) {
        var element = document.createElement(type),
            attributes = attr || {};

        for (attribute in attributes) {
            if (attributes.hasOwnProperty(attribute)) {
                element.setAttribute(attribute, attributes[attribute]);
            }
        }

        if (content) {
            element.innerHTML = content;
        }

        if (parent) {
            parent.appendChild(element);
        }

        return element;
    }

    /**
     * _updateTabs Updates tabs ids if some tab was removed
     * @private
     */
    TabsView.prototype._updateTabs = function() {
        this.tabs.forEach(function(element, index, array) {
            element.id = this.containerId + "-tab-" + index;
        }, this);
    }

    /**
     * _saveCurrentState Saves current state to localStorage
     * @private
     */
    TabsView.prototype._saveCurrentState = function() {
        localStorage[this.containerId] = JSON.stringify(this.activeTab);
    }

    /**
     * _restoreCurrentState Restore previous active tab
     * @private
     */
    TabsView.prototype._restoreCurrentState = function() {
        if (localStorage && localStorage[this.containerId]) {
            this.activeTab = JSON.parse(localStorage[this.containerId]);
            this.setActive(this.activeTab.num);
        }
    }

    /**
     * _createTab Creates new tab
     * @private
     * @param  {object} tab Tab description
     * @param  {number} index Number of created tab in set
     * @return {HTMLElement}
     */
    TabsView.prototype._createTab = function(tab, index) {
        var index = index || this.tabs.length;
        var attr = {
            id: this.containerId + "-tab-" + index,
            'data-div' : tab.id
        };

        if (tab.active) {
            attr.class = "tabActiveHeader";
            this.activeTab = {
                id: tab.id,
                num: index
            }
        }

        return this._createElm("li", attr, tab.title, "");
    }

    /**
     * addTab Adds new tab on the screen
     * @public
     * @param {object} tab Tab description
     * @param {number} index Number of a tab
     * @param {HTMLElement} parent Parent of the added tab
     * @param {HTMLElement} contentDiv Div with content for current tab
     */
  	TabsView.prototype.addTab = function(tab, index, parent, contentDiv) {
        if (typeof tab == 'string') {
            tab = JSON.parse(tab);
        }

        var currTab = this._createTab(tab, index),
            parent = parent || this.tabs[0].parentNode;

        currTab.onclick = this.setActive.bind(this);
        this.tabs.push(currTab);
        parent.appendChild(currTab);

        var divToAdd = this._createContentDiv(tab);

        if (contentDiv !== undefined) {
            contentDiv.appendChild(divToAdd);
        }
        else {
            this._getById(this.containerId + "-tabscontent").appendChild(divToAdd);
        }
    }

    /**
     * setActive Make some tab active
     * @public
     * @param {EventTarget|number} tab Target of click or number of the tab
     */
  	TabsView.prototype.setActive = function(tab) {
        var clickedElement;

        if (typeof tab == 'object') {
            clickedElement = tab.currentTarget;
        } else if (typeof tab == 'number') {
            clickedElement = this.tabs[tab];
        } else if (typeof tab == 'string') {
            clickedElement = this.tabs[+tab];
        }

        if (!clickedElement) {
            return;
        }

        var currentTabNum = clickedElement.parentNode.getAttribute("data-active"),
            currentDivId = clickedElement.parentNode.getAttribute("data-div"),
            currentTabId = this.containerId + "-tab-" + currentTabNum,
            currentTab = this._getById(currentTabId),
            newActiveTabId = clickedElement.id,
            newActiveTabNum = newActiveTabId.split('-')[2],
            newDivId = clickedElement.getAttribute('data-div');

        this.activeTab.num = newActiveTabNum;
        this.activeTab.id = newDivId;

        this._saveCurrentState();

        if (currentTab) {
            currentTab.removeAttribute("class");
            this._getById(currentDivId).className = "hide";
        }

        clickedElement.className = "tabActiveHeader";
        clickedElement.parentNode.setAttribute("data-active", newActiveTabNum);
        clickedElement.parentNode.setAttribute("data-div", newDivId);;
        
        this._getById(newDivId).className = "show";
  	}

    /**
     * setTitle Changes title of the tab
     * @public
     * @param {string} title
     * @param {number} index
     */
  	TabsView.prototype.setTitle = function(title, index) {
        var titleIndex;

        if (index === undefined || index == '') {
            titleIndex = this.activeTab.num;
        } else {
            titleIndex = +index;
        }

        if (this.tabs[titleIndex]) {
            this.tabs[titleIndex].innerHTML = title;
        }
  	}

    /**
     * setContent Sets content of the tab
     * @public
     * @param {string} content
     * @param {number} index
     */
  	TabsView.prototype.setContent = function(content, index) {
        var contentIndex;

        if (index === undefined || index == '') {
            contentIndex = this.activeTab.num;
        } else {
            contentIndex = +index;
        }

        if (this.tabs[contentIndex]) {
            var contentId = this.tabs[contentIndex].getAttribute("data-div");
            this._getById(contentId).innerHTML = content;
        }
  	}

    /**
     * getContent Gets content of the tab
     * @public
     * @param  {number} index
     * @return {string}
     */
  	TabsView.prototype.getContent = function(index) {
        var contentIndex;

        if (index === undefined || index == '') {
            contentIndex = this.activeTab.num;
        } else {
            contentIndex = +index;
        }

        var id = this.tabs[contentIndex].getAttribute("data-div");

  		return this._getById(id).innerHTML;
  	}

    /**
     * removeTab Removes chosen or active tab
     * @public
     * @param  {number} tabNum
     */
  	TabsView.prototype.removeTab = function(tabNum) {
        var tabNumToRemove;

        if (tabNum === undefined || tabNum == '') {
            tabNumToRemove = this.activeTab.num;
        } else {
            tabNumToRemove = +tabNum;
        }

        var tabToRemove = this.tabs[tabNumToRemove];

        if (!tabToRemove) {
            return;
        }

        var divId = tabToRemove.getAttribute("data-div"),
            divToRemove = this._getById(divId);

        divToRemove.parentNode.removeChild(divToRemove);
  		this.tabs[tabNumToRemove].parentNode.removeChild(this.tabs[tabNumToRemove]);
        obj.tabs.splice(tabNumToRemove, 1);

        this._updateTabs();

        // if active tab was removed, set 1st tab as active
        if (this.activeTab.id == divId) {
            if (!this.tabs[0]) {
                return;
            }

            var newActiveTabId = this.tabs[0].getAttribute("data-div");
            this.activeTab.num = 0;
            this.activeTab.id = newActiveTabId;
            this.tabs[0].className = "tabActiveHeader";
            this._getById(newActiveTabId).className = "show";
            this.tabs[0].parentNode.setAttribute("data-active", 0);
            this.tabs[0].parentNode.setAttribute("data-div", newActiveTabId);
        }

  	}

    /**
     * [getTitle Gets title of the chosen or active tab
     * @param {num} tab
     * @return {string}
     */
  	TabsView.prototype.getTitle = function(tab) {
        var tabNum = tab || this.activeTab.num;

  		return this.tabs[tabNum].innerHTML;
  	}

 	return TabsView;
})();