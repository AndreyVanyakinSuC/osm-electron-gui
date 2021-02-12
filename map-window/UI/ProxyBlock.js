import React from 'react';
import TextForm from './TextForm';

const ProxyBlock = ({ domain_user, password, inputChanged }) => {
  return (
    <div className="full-block">
      <div className="block-header">
        Параметры аутентификации прокси-сервера
      </div>
      <div className="proxy-inputs">
        {/* Domain input */}
        <span className="inputs-tile">
          <div>Имя пользователя в домене</div>
          <TextForm
            name="domain_user"
            value={domain_user}
            changed={inputChanged}
            title="Введите имя домена и пользователя"
            placeholder="MES\Ivanov"
          />
        </span>

        {/* Proxy password*/}
        <span className="inputs-tile">
          <div>Пароль</div>
          <TextForm
            name="password"
            value={password}
            changed={inputChanged}
            title="Введите пароль"
          />
        </span>
      </div>
    </div>
  );
};

export default ProxyBlock;
