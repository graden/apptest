function conf() {
    let config = {
    layout: {
        name: 'layout',
        padding: 0,
        panels: [
            { type: 'top', size: 45,  style: pstyle, overflow: 'hidden' },
            { type: 'left', size: 200, minSize: 40, style: pstyle },
            { type: 'main', minSize: 550, overflow: 'hidden', style: pstyle },
            { type: 'bottom', size: 20,  style: pstyle } 
        ]
    },
    sidebar: {
        name: 'sidebar',
        flatButton: false,	
        nodes: [
            { id: 'general', text: 'Настройки', group: true, expanded: true, groupShowHide: true,
              nodes: [
                { id: 'barUsers', text: 'Пользователи', icon: 'fa fa-home', selected: true },
                { id: 'barManagers', text: 'Менеджеры', icon: 'fa fa-users' }
              ],
              onCollapse(event) {
                  //event.preventDefault()
              }
            },
            { id: 'cli', text: 'Основные', group: true, expanded: true, groupShowHide: true,
              nodes: [
                { id: 'barClientes', text: 'Клиенты', icon: 'fa fa-home'  },
                { id: 'barMeetings', text: 'Встречи', icon: 'fa fa-users' }
              ],
              onCollapse(event) {
                  //event.preventDefault()
              }
            }
        ],
        onFlat: function (event) {
          //w2ui.layout.sizeTo('left', (event.goFlat ? 40 : 200), true);
        },
        onClick: function (event) {
            switch (event.target) {
                case 'barUsers':
                    w2ui.layout.html('main', w2ui.users);
                    break;
                case 'barManagers':
                    w2ui.layout.html('main', w2ui.managers);
                    break;
                case 'barClientes':
                    w2ui.layout.html('main', '<div style="padding: 10px">Some HTML</div>');
                    break;
            }
        }
    },
    users: {
      name : 'users',
      autoLoad : false,
      multiSelect : false,
      msgRefresh : "",
      show: {
        toolbar: true,
        searchAll: false,
        toolbarSearch: false,
        toolbarInput: false, 
        toolbarColumns: false,
        footer: true,
        toolbarAdd: true,
        toolbarDelete: true,
        toolbarSave: false,
        toolbarEdit: true
      },
      toolbar: {
        items: [
          {type: 'button', id: 'btnChgPassword', text: 'Изменить пароль', icon: 'fa fa-users', disabled: true }
        ],
        onClick : function(event) {
          if (event.target == 'btnChgPassword') w2alert('Password');
        }
      },
      url : {
        get    : '/listUsers',
        remove : '/removeUsers',
      },
      recid : 'ID',
      //attr: 'style = "font-size: 24px;"',
      //style: 'font-size:24px;color:blue',
      //recordHeight : 40,
      columns: [
        { field: 'FULLNAME', text: 'Имя пользователя', size: '30%' },
        { field: 'USERNAME', text: 'Логин', size: '20%' },
        { field: 'REGDATE', text: 'Дата рег.', size: '10%',  render: 'datetime:dd.mm.yyyy|hh:mi' },
	{ field: 'UPDDATE', text: 'Дата изм.', size: '10%',  render: 'datetime:dd.mm.yyyy|hh:mi' },
        { field: 'TEXT', text: 'Роль', size: '15%' }
      ]
    },
    managers: {
      name: 'managers',
      columns: [
          { field: 'state', text: 'State', size: '80px' },
          { field: 'title', text: 'Title', size: '100%' },
          { field: 'priority', text: 'Priority', size: '80px', attr: 'align="center"' }
      ],
      records: [
          { recid: 1, state: 'Open', title: 'Short title for the record', priority: 2 },
          { recid: 2, state: 'Open', title: 'Short title for the record', priority: 3 },
          { recid: 3, state: 'Closed', title: 'Short title for the record', priority: 1 }
      ]
    },
    formEdit: {
       name: 'foo',
      style: 'border: 0px; background-color: transparent;',
      url: '/saveUsers',
      fields: [
          { field: 'FULLNAME', type: 'text', required: true, html: { label: 'ФИО сотрудника', attr: 'style="width: 200px; padding: 2px;"'}},
          { field: 'USERNAME', type: 'text', required: true, html: { label: 'Имя пользователя', attr: 'style="width: 200px; padding: 2px;"'}},
          { field: 'ROLE', type: 'select', required: true, html: { label: 'Роли/Права', attr: 'style="width: 200px; padding: 2px;"'}},
      ],
      actions: {
         Cancel : function() { w2popup.close(); },
         Save   : function() { 
          let errors = this.validate();
          if (errors.length > 0) return;
          this.save();
        }
      },
      onSave: function(event) {
        let edata = $.extend({}, event);
        let response = JSON.parse(event.xhr.responseText);
        if (edata.xhr.status === 200) {
          //w2ui['users'].set(this.ID, this.record);
          //w2ui['users'].set(this.ID, response.record);
          w2ui['users'].reload();
          w2popup.close(); 
          //w2ui.layout.refresh('main'); 
        }
        if (edata.xhr.status === 201) {
          this.message(response.message);
        }
       }
    }
  }
  return config;
}