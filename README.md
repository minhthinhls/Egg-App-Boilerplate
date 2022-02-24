# <div align="center">EGG.JS FRAMEWORK</div>

<p align="center">
  <img src="https://raw.githubusercontent.com/minhthinhls/Egg-App-Boilerplate/master/app/public/poster.png" width="150" />
  <br />
  <b>Tomato Work Personal Affairs Management System</b>
  <p align="center">
    <a href="https://github.com/minhthinhls/Egg-App-Boilerplate">WEB</a>
    <a href="https://github.com/minhthinhls/Egg-App-Boilerplate">Applets</a>
  </p>
  <p align="center">
    <a href="https://github.com/minhthinhls/Egg-App-Boilerplate/stargazers">
      <img src="https://img.shields.io/github/stars/minhthinhls/Egg-App-Boilerplate" alt="Stars Badge"/>
    </a>
    <img src="https://img.shields.io/github/package-json/v/minhthinhls/Egg-App-Boilerplate" />
    <img src="https://img.shields.io/github/license/minhthinhls/Egg-App-Boilerplate" />
    <a href="https://hits.dwyl.com/minhthinhls/Egg-App-Boilerplate">
      <img src="https://hits.dwyl.com/minhthinhls/Egg-App-Boilerplate.svg" />
    </a>
  </p>
</p>

## Built with

- [Node >= 14.16.0](https://nodejs.org/en/)
- [Node Version Release](https://nodejs.org/en/download/releases/)
- [Egg Application - Documentation](https://eggjs.org/intro/)
- [Egg Application - Github](https://github.com/eggjs/)
- [Egg Application - NPM](https://www.npmjs.com/package/egg/)
- [Microsoft MySQL](https://www.mysql.com/)
- [Node Sequelize - Github](https://github.com/sequelize/sequelize)
- [Node Sequelize - NPM](https://www.npmjs.com/package/sequelize)
- [Node Version Manager - Github](https://github.com/coreybutler/nvm-windows/releases/tag/1.1.7)
- [Node Version Manager (Shell Script) - Github](https://github.com/nvm-sh/nvm)

## MySQL Setup

Simple MySQL install and config

- [Create New MySQL Database using MySQL Workbench](https://blog.devart.com/creating-a-new-database-in-mysql-tutorial-with-examples.html)
- [Create New MySQL Database using SSH Command Line Interface](https://www.inmotionhosting.com/support/server/databases/create-a-mysql-database/)

```
# Install mysql
sudo apt install mysql-server
systemctl status mysql.service

# Adjusting User Authentication 
sudo mysql
mysql > SELECT user,authentication_string,plugin,host FROM mysql.user;
mysql > ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '123456';

# Create a database for tomato_worker
mysql > CREATE DATABASE IF NOT EXISTS sales_db;
mysql > CREATE DATABASE sales_db;

# Later you can login to mysql via
mysql -u root -p
```

## Build Setup

- [Please configure database information before starting the project](config/config.default.ts)

``` bash
# Download
> git clone --depth=1 https://github.com/minhthinhls/Egg-App-Boilerplate.git

# Install
> npm install

# Generate Typescript on 'app/extend/types/(Controller|Service|Model).d.ts'
> npm run build

# Locking all files declared on 'app/utils/file/read-only/index.ts' to Read-Only Mode.
> npm run lock

# Dev-Mode & Hot-Reload & Port: 7003
> npm run dev

# Build Production & Start
> npm run compile
> npm run start
```

---

## Register Login User

Using Postman

URL: http://localhost:7003/api/user/register

BODY:

```bash
{
    "loginName": "test",
    "userName": "Test",
    "password": "123456",
    "role": 1
}
```

## License

[MIT](https://opensource.org/licenses/MIT)
