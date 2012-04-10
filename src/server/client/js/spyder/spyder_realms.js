(function(window, undefined){
Ext.namespace("Spyder.apps.realms");
registerMenu("realms", "realmsAmin", {
    xtype: "buttongroup",
    title: "开服管理",
    layout: "anchor",
    frame: true,
    width: 300,
    defaults: {
        scale: "large",
        rowspan: 3    
    },
    items: [
        {
            xtype: "button",
            text: "游戏列表",
            handler: function(){
                var item = Spyder.cache.menus["realms.gameList"];
                if (!item){
                    Spyder.workspace.addPanel("realms.gameList", "游戏列表", {
                        items: [
                            Ext.create("Spyder.apps.realms.gameList")
                        ]    
                    })
                }
            }
        },
	{
	    xtype: "button",
	    text: "运行商列表",
            handler: function(){
                var item = Spyder.cache.menus["realms.operaList"];
                if (!item){
                    Spyder.workspace.addPanel("realms.operaList", "游戏列表", {
                        items: [
                            Ext.create("Spyder.apps.realms.operaList")
                        ]    
                    })
                }
            }
	},
	{
	    text: "开服列表",
	    xtype : "button",
            handler: function(){
                var item = Spyder.cache.menus["realms.realmList"];
                if (!item){
                    Spyder.workspace.addPanel("realms.realmList", "游戏列表", {
                        items: [
                            Ext.create("Spyder.apps.realms.realmList")
                        ]    
                    })
                }
            }
	}
    ]
});

//申请服务
var realmServer = new SpyderRealmSvc(Spyder_server);
var cache = {}

var getGamesData = function(){
    realmServer.GetGameDataPageData(0, 99999999, "", {
	success: function(data){
	    data = Ext.JSON.decode(data);
	    data = data["Data"];
	    cache["games"] = data;
	},
	failure: function(error){
	    Ext.Error.raise(error);
	}
    })
}

var getOperatorData = function(){
    realmServer.GetOperatorPageData(0, 999999999, "", {
	success: function(data){
	    data = Ext.JSON.decode(data);
	    data = data["Data"];
	    cache["operators"] = data;
	},
	failure: function(error){
	    Ext.Error.raise(error);
	}
    })
}

getGamesData()
getOperatorData();

Ext.define("Spyder.apps.realms.addGame", {
    extend: "Ext.panel.Panel",
    border: false,
    layout: "anchor",
    height: "100%", 
    width: "100%",
    autoScroll: true,
    autoHeight: true,
    border: 0,
    bodyStyle: "background-color: #dfe8f5",
    defaults: {
        bodyStyle: "background-color: #dfe8f5",
        border: 0    
    },
    suspandLayout: true,
    initComponent: function(){
        var me = this;
        me.callParent();

        me.createMainPanel();
    },
    createMainPanel: function(){
        var me = this;
        var config = {
            autoHeight: true,
            autoScroll: true,
            cls: "iScroll",
            height: "100%",
            width: "100%",
            anchor: "fit",
            border: false,
            bodyBorder: false,
            plain: true,
            bodyPadding: "10",
            items: [
                {
                    layout: {
                        type:"table",
                        columns: 2,
                        tableAttrs: {
                            cellspacing: 10,
                            style: {
                                width: "100%"
                            }
                        }
                    },
                    border: false,
                    bodyStyle: "background-color: #dfe8f5",
                    defaults: {
                        bodyStyle: "background-color: #dfe8f5"
                    },
                    defaultType: "textfield",
                    fieldDefaults: {
                        msgTarget: "side",
                        labelAlign: "TOP",
                        labelWidth: 80
                    },
                    items: [
                        {
                            fieldLabel: "游戏名称",
                            allowBlank: false,
                            name: "name"
                        },
			{
			    xtype: "component",
			    width: 5
			},
                        {
                            fieldLabel: "描述",
                            name : "description",
			    xtype: "htmleditor",
			    colspan: 2
                        },
                        {
                            fieldLabel: "专题链接",
                            name: "url"
                        },
                        {
                            fieldLabel: "游戏类型",
                            name: "category"
                        },
			{
			    fieldLabel: "开发商",
			    name: "developer"
			},
                        {
                            fieldLabel: "画面",
                            name: "type"
                        },
                        {
                            fieldLabel: "题材",
                            name: "theme"
                        },
                    ]
                },
                {
                    xtype: "button",
                    text: "重置",
                    handler: function(){
                        me.form.getForm().reset();
                    }
                },
		{
		    xtype: "button",
		    text: "删除",
		    handler: function(){
			realmServer.DeleteGame(me.selectedGID, {
			    success: function(succ){
				if (succ){
				    Ext.Msg.alert("成功", "删除成功");
				    if (me.callback){
					me.callback();
				    }
				}
			    },
			    failure: function(){
			    }
			})
		    }
		},
                {
                    xtype: "button",
                    text: "提交",
                    disabled: true,
                    formBind: true,
                    style: {
                        marginLeft: "10px"
                    },
                    handler: function(){
			me.processForm();
                    }
                }
            ],
        }

        var form = Ext.widget("form", config);
        me.form = form
        me.add(form)
        me.doLayout();
    },
    restoreForm: function(record){
	var me = this, form = me.form.getForm();
	form.setValues(record.data);
	me.selectedGID = record.get("id");
    },
    processForm: function(){
	var me = this, action = me.action || "view";
	if (action == "add" || action == "edit"){
	    var form = me.form.getForm();
	    values = form.getValues();

	    if (action == "add"){
		realmServer.AddGame(Ext.JSON.encode(values), {
		    success: function(gid){
			if (gid){
			    Ext.Msg.alert("添加成功", "添加游戏成功");
			}
			if (me.callback){
			    me.callback();
			}
			getGamesData()
		    },
		    failure: function(error){
			Ext.Error.raise(error);
		    }
		})
	    }else{
		if (action == "edit") {
		    if (me.selectedGID == undefined){
			Ext.Msg.alert("失败", "编辑失败, 请选择需要编辑的游戏")
			return;
		    }
		    realmServer.EditGame(me.selectedGID, Ext.JSON.encode(values), {
			success: function(succ){
			    if (succ){
				Ext.Msg.alert("编辑成功", "编辑游戏成功");
			    }else{
				Ext.Msg.alert("编辑失败", "编辑游戏失败");
			    }
			    if (me.callback){
				me.callback();
			    }
			    getGamesData()
			},
			failure: function(error){
			    Ext.Error.raise(error);
			}
		    })
		}
	    }
	}
    }
})


Ext.define("Spyder.apps.realms.gameList", {
    extend: "Ext.panel.Panel",    
    layout: "fit",
    width: "100%",
    bodyBorder: false,
    autoHeight: true,
    frame: true,
    b_filter: "",
    b_type: "list",
    defaults: {
        border: 0
    },
    initComponent: function(){
        var me = this

        me.callParent();
	
	realmServer.GetGameDataPageData(0, 1, "", {
            success: function(data){
                var data = Ext.JSON.decode(data);
                metadata = data["MetaData"];
                me.buildStoreAndModel(metadata);
            },
            failure: function(error){
                Ext.Error.raise(error)
            }
        })
    },
    buildStoreAndModel: function(metadata){
        var me = this, fields = [], columns = [];
        me.columns = columns;
        for (var c = 0; c < metadata.length; ++c){
            var d = metadata[c];
            fields.push(d["dataIndex"])
            if (!d["fieldHidden"]){
		var column = {
                    flex: 1,
                    header: d["fieldName"],
                    dataIndex: d["dataIndex"]    
                }

                columns.push(column);
            }
        }

        if (!Spyder.apps.realms.gameListModel){
            Ext.define("Spyder.apps.realms.gameListModel", {
                extend: "Ext.data.Model",
                fields: fields    
            })
        }

        if (!Ext.isDefined(Spyder.apps.realms.gameListStore)){
            Ext.define("Spyder.apps.realms.gameListStore", {
                extend: "Ext.data.Store",
                model: Spyder.apps.realms.gameListModel,
                autoLoad: true,
                pageSize: 50,
                load: function(options){
                    var me = this;
                    options = options || {};
                    if (Ext.isFunction(options)) {
                        options = {
                            callback: options
                        };
                    }

                    startPage = (me.currentPage - 1) * me.pageSize,
                    Ext.applyIf(options, {
                        groupers: me.groupers.items,
                        page: me.currentPage,
                        start: startPage,
                        limit: me.pageSize,
                        addRecords: false
                    });      

                    me.proxy.b_params["start"] = options["start"] || startPage
                    me.proxy.b_params["limit"] = options["limit"]

                    return me.callParent([options]);
                }
            });
        }

        me.storeProxy = Ext.create("Spyder.apps.realms.gameListStore");
        me.storeProxy.setProxy(me.updateProxy());
	me.createGrid();
    },
    updateProxy: function(){
        var me = this;
        return {
             type: "b_proxy",
             b_method: realmServer.GetGameDataPageData,
             startParam: "start",
             limitParam: "limit",
             b_params: {
                 "filter": me.b_filter
             },
             b_scope: realmServer,
             reader: {
                 type: "json",
                 root: "Data",
                 totalProperty: "TotalCount"
             }
        }
    },
    createGrid: function(){
        var me = this, store = me.storeProxy;
        me.grid = Ext.create("Spyder.plugins.LiveSearch", {
            store: store,
            lookMask: true,
            //selModel: sm,
            frame: true,
            collapsible: false,    
            rorder: false,
            bodyBorder: false,
            autoScroll: true,
            autoHeight: true,
            height: "100%",
            width : "100%",
            border: 0,
            columnLines: true,
            viewConfig: {
                trackOver: false,
                stripeRows: true
            },
	    tbar: [
		"-",
		{
		    xtype: "button",
		    text : "增加游戏",
		    handler: function(){
			var panel = Ext.create("Spyder.apps.realms.addGame", {
			    action : "add",
			    autoScroll: true,
			    callback: function(){
				me.storeProxy.loadPage(1);
			    }
			});
			var win = Ext.create("Ext.window.Window", {
			    width: 1000,
			    height: 500,
			    title: "增加游戏",
			    items: [
				panel
			    ]
			});
			win.show();
		    }
		}
	    ],
            columns: me.columns,
            bbar: Ext.create('Ext.PagingToolbar', {
                store: me.storeProxy,
                displayInfo: true,
                displayMsg: '当前显示 {0} - {1}, 总共{2}条数据',
                emptyMsg: "没有数据"
            })
        })

        me.grid.on("itemdblclick", me.viewGame, me)

        me.add(me.grid);
        me.doLayout();
    },
    viewGame: function(f, record){
	var me = this;
	var panel = Ext.create("Spyder.apps.realms.addGame", {
	    action : "edit",
	    autoScroll: true,
	    callback: function(){
		me.storeProxy.loadPage(1);
	    }
	});
	panel.restoreForm(record)
	var win = Ext.create("Ext.window.Window", {
	    width: 1000,
	    height: 500,
	    title: "编辑游戏: " + record.get("name"),
	    items: [
		panel
	    ]
	});
	win.show();
    }
})


Ext.define("Spyder.apps.realms.addOperator", {
    extend: "Ext.panel.Panel",
    border: false,
    layout: "anchor",
    height: "100%", 
    width: "100%",
    autoScroll: true,
    autoHeight: true,
    border: 0,
    bodyStyle: "background-color: #dfe8f5",
    defaults: {
        bodyStyle: "background-color: #dfe8f5",
        border: 0    
    },
    suspandLayout: true,
    initComponent: function(){
        var me = this;
        me.callParent();

        me.createMainPanel();
    },
    createMainPanel: function(){
        var me = this;
        var config = {
            autoHeight: true,
            autoScroll: true,
            cls: "iScroll",
            height: "100%",
            width: "100%",
            anchor: "fit",
            border: false,
            bodyBorder: false,
            plain: true,
            bodyPadding: "10",
            items: [
                {
                    layout: {
                        type:"table",
                        columns: 1,
                        tableAttrs: {
                            cellspacing: 10,
                            style: {
                                width: "100%"
                            }
                        }
                    },
                    border: false,
                    bodyStyle: "background-color: #dfe8f5",
                    defaults: {
                        bodyStyle: "background-color: #dfe8f5"
                    },
                    defaultType: "textfield",
                    fieldDefaults: {
                        msgTarget: "side",
                        labelAlign: "TOP",
                        labelWidth: 80
                    },
                    items: [
                        {
                            fieldLabel: "游戏名称",
                            allowBlank: false,
                            name: "name"
                        },
                        {
                            fieldLabel: "链接",
                            name: "url"
                        },
                    ]
                },
                {
                    xtype: "button",
                    text: "重置",
                    handler: function(){
                        me.form.getForm().reset();
                    }
                },
                {
                    xtype: "button",
                    text: "提交",
                    disabled: true,
                    formBind: true,
                    style: {
                        marginLeft: "10px"
                    },
                    handler: function(){
			me.processForm();
                    }
                }
            ],
        }

        var form = Ext.widget("form", config);
        me.form = form
        me.add(form)
        me.doLayout();
    },
    restoreForm: function(record){
	var me = this, form = me.form.getForm();
	form.setValues(record.data);
	me.selectedOID = record.get("id");
    },
    processForm: function(){
	var me = this, action = me.action || "view";
	if (action == "add" || action == "edit"){
	    var form = me.form.getForm();
	    values = form.getValues();

	    if (action == "add"){
		realmServer.AddOperator(Ext.JSON.encode(values), {
		    success: function(gid){
			if (gid){
			    Ext.Msg.alert("添加成功", "添加运营厂商成功");
			}
			if (me.callback){
			    me.callback();
			    getOperatorData();
			}
		    },
		    failure: function(error){
			Ext.Error.raise(error);
		    }
		})
	    }else{
		if (action == "edit") {
		    if (me.selectedOID == undefined){
			Ext.Msg.alert("失败", "编辑失败, 请选择需要编辑的运营厂商")
			return;
		    }
		    realmServer.EditOperator(me.selectedOID, Ext.JSON.encode(values), {
			success: function(succ){
			    if (succ){
				Ext.Msg.alert("编辑成功", "编辑运营厂商成功");
			    }else{
				Ext.Msg.alert("编辑失败", "编辑运营厂商失败");
			    }
			    if (me.callback){
				me.callback();
			    }
			    getOperatorData();
			},
			failure: function(error){
			    Ext.Error.raise(error);
			}
		    })
		}
	    }
	}
    }
})


Ext.define("Spyder.apps.realms.operaList", {
    extend: "Ext.panel.Panel",    
    layout: "fit",
    width: "100%",
    bodyBorder: false,
    autoHeight: true,
    frame: true,
    b_filter: "",
    b_type: "list",
    defaults: {
        border: 0
    },
    initComponent: function(){
        var me = this

        me.callParent();
	
	realmServer.GetOperatorPageData(0, 1, "", {
            success: function(data){
                var data = Ext.JSON.decode(data);
                metadata = data["MetaData"];
                me.buildStoreAndModel(metadata);
            },
            failure: function(error){
                Ext.Error.raise(error)
            }
        })
    },
    buildStoreAndModel: function(metadata){
        var me = this, fields = [], columns = [];
        me.columns = columns;
        for (var c = 0; c < metadata.length; ++c){
            var d = metadata[c];
            fields.push(d["dataIndex"])
            if (!d["fieldHidden"]){
		var column = {
                    flex: 1,
                    header: d["fieldName"],
                    dataIndex: d["dataIndex"]    
                }

                columns.push(column);
            }
        }

        if (!Spyder.apps.realms.operaListModel){
            Ext.define("Spyder.apps.realms.operaListModel", {
                extend: "Ext.data.Model",
                fields: fields    
            })
        }

        if (!Ext.isDefined(Spyder.apps.realms.operaListStore)){
            Ext.define("Spyder.apps.realms.operaListStore", {
                extend: "Ext.data.Store",
                model: Spyder.apps.realms.operaListModel,
                autoLoad: true,
                pageSize: 50,
                load: function(options){
                    var me = this;
                    options = options || {};
                    if (Ext.isFunction(options)) {
                        options = {
                            callback: options
                        };
                    }

                    startPage = (me.currentPage - 1) * me.pageSize,
                    Ext.applyIf(options, {
                        groupers: me.groupers.items,
                        page: me.currentPage,
                        start: startPage,
                        limit: me.pageSize,
                        addRecords: false
                    });      

                    me.proxy.b_params["start"] = options["start"] || startPage
                    me.proxy.b_params["limit"] = options["limit"]

                    return me.callParent([options]);
                }
            });
        }

        me.storeProxy = Ext.create("Spyder.apps.realms.operaListStore");
        me.storeProxy.setProxy(me.updateProxy());
	me.createGrid();
    },
    updateProxy: function(){
        var me = this;
        return {
             type: "b_proxy",
             b_method: realmServer.GetOperatorPageData,
             startParam: "start",
             limitParam: "limit",
             b_params: {
                 "filter": me.b_filter
             },
             b_scope: realmServer,
             reader: {
                 type: "json",
                 root: "Data",
                 totalProperty: "TotalCount"
             }
        }
    },
    createGrid: function(){
        var me = this, store = me.storeProxy;
        me.grid = Ext.create("Spyder.plugins.LiveSearch", {
            store: store,
            lookMask: true,
            //selModel: sm,
            frame: true,
            collapsible: false,    
            rorder: false,
            bodyBorder: false,
            autoScroll: true,
            autoHeight: true,
            height: "100%",
            width : "100%",
            border: 0,
            columnLines: true,
            viewConfig: {
                trackOver: false,
                stripeRows: true
            },
	    tbar: [
		"-",
		{
		    xtype: "button",
		    text : "增加运行商",
		    handler: function(){
			var panel = Ext.create("Spyder.apps.realms.addOperator", {
			    action : "add",
			    autoScroll: true,
			    callback: function(){
				me.storeProxy.loadPage(1);
			    }
			});
			var win = Ext.create("Ext.window.Window", {
			    width: 500,
			    height: 300,
			    title: "增加运行商",
			    items: [
				panel
			    ]
			});
			win.show();
		    }
		}
	    ],
            columns: me.columns,
            bbar: Ext.create('Ext.PagingToolbar', {
                store: me.storeProxy,
                displayInfo: true,
                displayMsg: '当前显示 {0} - {1}, 总共{2}条数据',
                emptyMsg: "没有数据"
            })
        })

        me.grid.on("itemdblclick", me.viewOperator, me)

        me.add(me.grid);
        me.doLayout();
    },
    viewOperator: function(f, record){
	var me = this;
	var panel = Ext.create("Spyder.apps.realms.addOperator", {
	    action : "edit",
	    autoScroll: true,
	    callback: function(){
		me.storeProxy.loadPage(1);
	    }
	});
	panel.restoreForm(record)
	var win = Ext.create("Ext.window.Window", {
	    width: 300,
	    height: 300,
	    title: "编辑运营商: " + record.get("name"),
	    items: [
		panel
	    ]
	});
	win.show();
    }
})


Ext.define("Spyder.apps.realms.addRealm", {
    extend: "Ext.panel.Panel",
    border: false,
    layout: "anchor",
    height: "100%", 
    width: "100%",
    autoScroll: true,
    autoHeight: true,
    border: 0,
    bodyStyle: "background-color: #dfe8f5",
    defaults: {
        bodyStyle: "background-color: #dfe8f5",
        border: 0    
    },
    suspandLayout: true,
    initComponent: function(){
        var me = this;
        me.callParent();
	
	me.gameList = Ext.create("Ext.data.Store", {
	    fields: ["itemid", "name"],
	    data  : cache["games"]  
	})

	me.operalist = Ext.create("Ext.data.Store", {
	    fields: ["id", "name"],
	    data  : cache["operators"]  
	})

	me.statuslist = Ext.create("Ext.data.Store", {
	    fields: ["id", "name"],
	    data : [
		{id: 0, name: "即将开服"},
		{id : 1, name: "已经开服"}
	    ]   
	})
	
        me.createMainPanel();
    },
    createMainPanel: function(){
        var me = this;
        var config = {
            autoHeight: true,
            autoScroll: true,
            cls: "iScroll",
            height: "100%",
            width: "100%",
            anchor: "fit",
            border: false,
            bodyBorder: false,
            plain: true,
            bodyPadding: "10",
            items: [
                {
                    layout: {
                        type:"table",
                        columns: 1,
                        tableAttrs: {
                            cellspacing: 10,
                            style: {
                                width: "100%"
                            }
                        }
                    },
                    border: false,
                    bodyStyle: "background-color: #dfe8f5",
                    defaults: {
                        bodyStyle: "background-color: #dfe8f5"
                    },
                    defaultType: "textfield",
                    fieldDefaults: {
                        msgTarget: "side",
                        labelAlign: "TOP",
                        labelWidth: 80
                    },
                    items: [
                        {
                            fieldLabel: "名称",
                            allowBlank: false,
                            name: "name"
                        },
                        {
                            fieldLabel: "游戏",
                            allowBlank: false,
                            name: "gid",
			    xtype: "combobox",
			    queryMode: "local",
			    displayField: "name",
			    valueField: "itemid",
			    editable: false,
			    store: me.gameList
                        },
                        {
                            fieldLabel: "运营商",
                            allowBlank: false,
                            name: "oid",
			    xtype: "combobox",
			    queryMode: "local",
			    displayField: "name",
			    valueField: "id",
			    editable: false,
			    store: me.operalist
                        },
			{
			    fieldLabel: "url",
			    name: "url"
			},
			{
			    fieldLabel: "开服日期",
			    name: "_date",
                            allowBlank: false,
			    xtype: "datefield",
			    format: "Y/m/d"
			},
			{
			    fieldLabel: "开服时间",
			    name: "time",
			    allowBlank: false,
			    xtype: "timefield",
			    format: "H:i"
			},
			{
			    fieldLabel: "当前状态",
			    name: "status",
			    xtype: "combobox",
			    queryMode: "local",
			    displayField: "name",
			    valueField: "id",
			    editable: false,
                            allowBlank: false,
			    store: me.statuslist
			}
                    ]
                },
                {
                    xtype: "button",
                    text: "重置",
                    handler: function(){
                        me.form.getForm().reset();
                    }
                },
                {
                    xtype: "button",
                    text: "提交",
                    disabled: true,
                    formBind: true,
                    style: {
                        marginLeft: "10px"
                    },
                    handler: function(){
			me.processForm();
                    }
                }
            ],
        }

        var form = Ext.widget("form", config);
        me.form = form
        me.add(form)
        me.doLayout();
    },
    restoreForm: function(record){
	var me = this, form = me.form.getForm();
	form.setValues(record.data);
	form.setValues({
	    "status" : record.get("_status"),
	    "_date" : new Date(record.get("date")),
	    "time"  : new Date(record.get("date"))
	})

	me.selectedRID = record.get("id");
    },
    processForm: function(){
	var me = this, action = me.action || "view";
	if (action == "add" || action == "edit"){
	    var form = me.form.getForm();
	    values = form.getValues();

	    date = new Date(values["_date"] + " " + values["time"]);
	    values["date"] = +date;

	    if (action == "add"){
		realmServer.AddRealm(Ext.JSON.encode(values), {
		    success: function(gid){
			if (gid){
			    Ext.Msg.alert("添加成功", "添加成功");
			}
			if (me.callback){
			    me.callback();
			}
		    },
		    failure: function(error){
			Ext.Error.raise(error);
		    }
		})
	    }else{
		if (action == "edit") {
		    if (me.selectedRID == undefined){
			Ext.Msg.alert("失败", "编辑失败, 请选择需要编辑的开服")
			return;
		    }
		    realmServer.EditRealm(me.selectedRID, Ext.JSON.encode(values), {
			success: function(succ){
			    if (succ){
				Ext.Msg.alert("编辑成功", "编辑成功");
			    }else{
				Ext.Msg.alert("编辑失败", "编辑失败");
			    }
			    if (me.callback){
				me.callback();
			    }
			},
			failure: function(error){
			    Ext.Error.raise(error);
			}
		    })
		}
	    }
	}
    }
})


Ext.define("Spyder.apps.realms.realmList", {
    extend: "Ext.panel.Panel",    
    layout: "fit",
    width: "100%",
    bodyBorder: false,
    autoHeight: true,
    frame: true,
    b_filter: "",
    b_type: "list",
    defaults: {
        border: 0
    },
    initComponent: function(){
        var me = this

        me.callParent();
	
	realmServer.GetRealmPageData(0, 1, "", {
            success: function(data){
                var data = Ext.JSON.decode(data);
                metadata = data["MetaData"];
                me.buildStoreAndModel(metadata);
            },
            failure: function(error){
                Ext.Error.raise(error)
            }
        })
    },
    buildStoreAndModel: function(metadata){
        var me = this, fields = [], columns = [];
        me.columns = columns;
        for (var c = 0; c < metadata.length; ++c){
            var d = metadata[c];
            fields.push(d["dataIndex"])
            if (!d["fieldHidden"]){
		var column = {
                    flex: 1,
                    header: d["fieldName"],
                    dataIndex: d["dataIndex"]    
                }

		if (d["fieldName"] == "date"){
		    column.xtype = "datecolumn";
		    column.format = "Y/m/d H:i";
		}

                columns.push(column);
            }
        }

        if (!Spyder.apps.realms.realmListModel){
            Ext.define("Spyder.apps.realms.realmListModel", {
                extend: "Ext.data.Model",
                fields: fields    
            })
        }

        if (!Ext.isDefined(Spyder.apps.realms.realmListStore)){
            Ext.define("Spyder.apps.realms.realmListStore", {
                extend: "Ext.data.Store",
                model: Spyder.apps.realms.realmListModel,
                autoLoad: true,
                pageSize: 50,
                load: function(options){
                    var me = this;
                    options = options || {};
                    if (Ext.isFunction(options)) {
                        options = {
                            callback: options
                        };
                    }

                    startPage = (me.currentPage - 1) * me.pageSize,
                    Ext.applyIf(options, {
                        groupers: me.groupers.items,
                        page: me.currentPage,
                        start: startPage,
                        limit: me.pageSize,
                        addRecords: false
                    });      

                    me.proxy.b_params["start"] = options["start"] || startPage
                    me.proxy.b_params["limit"] = options["limit"]

                    return me.callParent([options]);
                }
            });
        }

        me.storeProxy = Ext.create("Spyder.apps.realms.realmListStore");
        me.storeProxy.setProxy(me.updateProxy());

	var status = {
	    0 : "即将开服",
	    1 : "已经开服"
	}
	me.storeProxy.on({
	    load: function(f, records){
		for (var c = 0; c < records.length; ++c){
		    var record = records[c];
		    record.set("date", new Date(record.get("date") * 1))
		    record.set("_status", record.get("status"));
		    record.set("status", status[record.get("status")]);
		}
	    }
	})

	me.createGrid();
    },
    updateProxy: function(){
        var me = this;
        return {
             type: "b_proxy",
             b_method: realmServer.GetRealmPageData,
             startParam: "start",
             limitParam: "limit",
             b_params: {
                 "filter": me.b_filter
             },
             b_scope: realmServer,
             reader: {
                 type: "json",
                 root: "Data",
                 totalProperty: "TotalCount"
             }
        }
    },
    createGrid: function(){
        var me = this, store = me.storeProxy;
        me.grid = Ext.create("Spyder.plugins.LiveSearch", {
            store: store,
            lookMask: true,
            //selModel: sm,
            frame: true,
            collapsible: false,    
            rorder: false,
            bodyBorder: false,
            autoScroll: true,
            autoHeight: true,
            height: "100%",
            width : "100%",
            border: 0,
            columnLines: true,
            viewConfig: {
                trackOver: false,
                stripeRows: true
            },
	    tbar: [
		"-",
		{
		    xtype: "button",
		    text : "增加开服",
		    handler: function(){
			var panel = Ext.create("Spyder.apps.realms.addRealm", {
			    action : "add",
			    autoScroll: true,
			    callback: function(){
				me.storeProxy.loadPage(1);
			    }
			});
			var win = Ext.create("Ext.window.Window", {
			    width: 300,
			    height: 300,
			    title: "增加开服",
			    items: [
				panel
			    ]
			});
			win.show();
		    }
		}
	    ],
            columns: me.columns,
            bbar: Ext.create('Ext.PagingToolbar', {
                store: me.storeProxy,
                displayInfo: true,
                displayMsg: '当前显示 {0} - {1}, 总共{2}条数据',
                emptyMsg: "没有数据"
            })
        })

        me.grid.on("itemdblclick", me.viewOperator, me)

        me.add(me.grid);
        me.doLayout();
    },
    viewOperator: function(f, record){
	var me = this;
	var panel = Ext.create("Spyder.apps.realms.addRealm", {
	    action : "edit",
	    autoScroll: true,
	    callback: function(){
		me.storeProxy.loadPage(1);
	    }
	});
	panel.restoreForm(record)
	var win = Ext.create("Ext.window.Window", {
	    width: 300,
	    height: 300,
	    title: "编辑开服: " + record.get("name"),
	    items: [
		panel
	    ]
	});
	win.show();
    }
})

})(window, undefined);
