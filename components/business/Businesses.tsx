import React from 'react'
import CreateBusinessForm from './CreateBusinessForm'
import BusinessesTable from './BusinessesTable'
import { useAppContext } from '@/context/AppProvider';

type Props = {}

function Businesses({ }: Props) {
    const { data, actions } = useAppContext();
    const { godMode } = data;
    return (
        <div>
            {
                godMode ?
                    <div className='flex flex-col gap-6'>
                        <CreateBusinessForm />
                        <BusinessesTable />
                    </div>
                    : null
            }
        </div>
    )
}

export default Businesses