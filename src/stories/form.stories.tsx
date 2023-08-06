import React, { useEffect, useMemo } from 'react';

import { ComponentMeta, ComponentStory } from '@storybook/react';

import Form from '../components/form/form';
import { FormItemProps } from '../types/form';
import { DynamicWildCardType } from '../types/misc';


export default {
  /* 👇 The title prop is optional.
  * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
  * to learn how to generate automatic titles
  */
  title: 'Components/Forms',
  component: Form,
} as ComponentMeta<typeof Form>;


export const Basic = () => {

  const formRef = Form.useForm();

  const onSubmit = (data: any) => {
    formRef.submit()
  }


  const onChange = (newValue: DynamicWildCardType, newData: DynamicWildCardType) => {
    
  }

  const items: FormItemProps[] = useMemo(() => ([
    {
      name: 'username',
      label: 'Username',
      type: 'text',
      icon: <></>,
      validation: (value: any) => {},
      info: { enabled: true, message: 'Your Username' }
    },
    {
      name: 'password',
      label: 'Password',
      type: 'password',
      icon: <></>,
      validation: (value: any) => {},
      info: { enabled: true, message: 'Your Password' }
    }
  ]), [])


  return (
    <Form 
      form={formRef} 
      items={items} 
      layout='vertical' 
      onSubmit={onSubmit} 
      onChange={onChange}
      button={{
        enabled: true,
        props: {
          type: 'primary',
          content: 'Submit Form'
        }
      }}
    />
  )
}