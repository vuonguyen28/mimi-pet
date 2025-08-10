'use client';
import { App } from 'antd';

export function useShowMessage(p0: string, p1: string) {
  const { message } = App.useApp();

  return {
    success: (msg: string) => message.success(msg),
    error: (msg: string) => message.error(msg),
    info: (msg: string) => message.info(msg),
    warning: (msg: string) => message.warning(msg),
  };
}