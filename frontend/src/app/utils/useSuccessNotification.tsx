'use client';
import { App } from 'antd';

export function useSuccessNotification() {
  const { notification } = App.useApp();

  return (title: string, description: string) => {
    notification.success({
      message: title,
      description: description,
      placement: 'topRight',
    });
  };
}