$(function () {

  w2utils.locale('ru-ru');
  $('#lstUsers').w2grid({
    name   : 'myGrid',
    url    : '/listUsers',
    columns: [
        { field: 'ID', text: 'ID', size: '5%' },
        { field: 'FULLNAME', text: 'Имя пользователя', size: '30%' },
        { field: 'USERNAME', text: 'Логин', size: '20%' },
        { field: 'REGDATE', text: 'Регистрация', size: '20%',  render: 'datetime:dd.mm.yyyy|hh:mi' },
        { field: 'ROLE', text: 'Роль', size: '5%' }
    ]
  });

});