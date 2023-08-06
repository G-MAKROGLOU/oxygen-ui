import { BreadcrumbsProps } from '../../types/breadcrumbs';
import { RxSlash } from 'react-icons/rx'

const Breadcrumbs = ({
    items,
    asLinks = false,
    onClick,
    separator = <RxSlash/>,
    activeKey
}: BreadcrumbsProps) => {
    const oxyOnClick = (key: string | number) => {
        if (asLinks && onClick){
            onClick(key)
        }
    }

    return (
        <div className='oxyui__breadcrumbs__wrapper'>
            {items.map((item, i) => (
                <span key={item.key} className='oxyui__breadcrumb__with__separator'>
                    <span onClick={() => oxyOnClick(item.key)} className={`oxyui__breadcrumb ${item.key === activeKey ? 'oxyui__breadcrumb__active' : ''} ${asLinks ? 'oxyui__breadcrumb__link' : ''}`}>
                        {item.icon ? <span className='oxyui__breadcrumb__icon'>{item.icon}</span> : null}
                        <span>{item.value}</span>
                    </span>
                    {
                        i < items.length - 1 
                        ? <span className='oxyui__breadcrumbs__separator'>
                            {separator}
                           </span> 
                        : null
                    }
                </span>
               
            ))}
        </div>
    )
}

export default Breadcrumbs;