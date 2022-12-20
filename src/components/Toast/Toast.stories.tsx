import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';
import { Button } from '../Button';
import { Icon } from '../Icon';
import documentation from './documentation.mdx';
import {
  ToastRoot,
  ToastAction,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  ToastClose,
} from './Toast';
import toastStyles from './Toast.module.css';

export default {
  title: 'Components/Toast',
  component: ToastRoot,
  parameters: {
    controls: {
      hideNoControlsWarning: true,
    },
    docs: {
      page: documentation,
    },
  },
} as ComponentMeta<typeof ToastRoot>;

const Template: ComponentStory<typeof ToastRoot> = (args) => {
  const [open, setOpen] = React.useState(false);
  const timerRef = React.useRef(0);

  React.useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  return (
    <ToastProvider swipeDirection="right">
      <Button
        onClick={() => {
          setOpen(false);
          window.clearTimeout(timerRef.current);
          timerRef.current = window.setTimeout(() => {
            setOpen(true);
          }, 100);
        }}
        size="small"
        variant="secondary"
      >
        Add to calendar
      </Button>

      <ToastRoot
        className={toastStyles.toastRoot}
        open={open}
        onOpenChange={setOpen}
      >
        <ToastTitle className={toastStyles.toastTitle}>
          <Icon id="exclamation-triangle" size="medium" />
          Alert title
          <ToastClose className={toastStyles.toastClose} aria-label="Close">
            <Icon id="cross-2" size="medium" aria-hidden />
          </ToastClose>
        </ToastTitle>
        <ToastDescription asChild>
          <p className={toastStyles.toastDescription}>
            Alert body copy goes here which is reduced to two lines
          </p>
        </ToastDescription>
        <ToastAction
          className={toastStyles.toastAction}
          asChild
          altText="Goto schedule to undo"
        >
          <button className="Button small green">Continue</button>
        </ToastAction>
      </ToastRoot>
      <ToastViewport className={toastStyles.toastViewport} />
    </ToastProvider>
  );
};

export const toast = Template.bind({});
