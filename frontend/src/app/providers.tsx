'use client';
import { Provider } from 'react-redux';
import { ReactNode } from 'react';
import { store, persistor } from './store/store';
import { PersistGate } from 'redux-persist/integration/react';
import { ConfigProvider, App as AntdApp } from 'antd';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ConfigProvider
          theme={{
            token: {
              fontFamily: "'Baloo 2', cursive, sans-serif", // Đổi font toàn bộ AntD
            },
          }}
        >
          <AntdApp>
            {children}
          </AntdApp>
        </ConfigProvider>
      </PersistGate>
    </Provider>
  );
}