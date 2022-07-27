$(function () {

 w2utils.locale("ru-ru");
  
 $('#loginForm').w2form({
   name: 'loginForm',
   header: '<div style="text-align: left";> CRM Помощник </div>',
   url: '/login',
   record: {
       username: '',
       password: ''
   },
   fields: [
       { field: 'username', type: 'text', required: true,
          html: {
                    label: 'Имя пользователя:',
                    attr: 'style="width: 200px"'
                }
       },
       { field: 'password',  type: 'password', required: true, 
          html: {
                    label: 'Пароль:',
                    attr: 'style="width: 200px"'
                }
       },
   ],
   actions: {
       save: {
          text: 'Ok',
          onClick() {
            this.save();
          }
       }
   },
   onSave: function(event) {
        let edata = $.extend({}, event);
        if (edata.xhr.status === 200) {
          window.location.href="/";   
        }
        if (edata.xhr.status === 201) {
           w2ui.loginForm.message(edata.xhr.responseJSON);
        }
   }
 });
 
});