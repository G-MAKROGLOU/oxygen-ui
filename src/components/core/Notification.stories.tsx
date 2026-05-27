import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { NotificationProvider, useNotification } from './Notification'
import Button from '../inputs/Button'

const meta: Meta = {
    title: 'Core/Notification',
    parameters: { layout: 'centered' },
    tags: ['autodocs'],
    decorators: [(Story) => <NotificationProvider><Story /></NotificationProvider>],
}
export default meta

const Demo = () => {
    const { info, success, warning, danger } = useNotification()
    return (
        <div className="flex gap-2 flex-wrap">
            <Button content="Info" onClick={() => info({ title: 'Info', description: 'Something happened.' })} />
            <Button content="Success" onClick={() => success({ title: 'Done!', description: 'Action completed.' })} />
            <Button content="Warning" onClick={() => warning({ title: 'Warning', description: 'Check this.' })} />
            <Button content="Error" onClick={() => danger({ title: 'Error', description: 'Something went wrong.' })} />
        </div>
    )
}

export const AllVariants: StoryObj = { render: () => <Demo /> }
