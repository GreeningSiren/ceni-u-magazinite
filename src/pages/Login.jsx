import { Auth } from '@supabase/auth-ui-react'
import supabase from '../utils/supabase'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { useState } from 'react'

export default function Login({ session }) {
    const [currentviewin, setcurrentviewin] = useState('true')
    if (!session) {
        return (
            <div className="mx-[2%]">
                <Auth supabaseClient={supabase} appearance={{
                    theme: ThemeSupa,
                    variables: {
                        default: {
                            colors: {
                                brand: 'green',
                                brandAccent: 'darkgreen',
                            }
                        }
                    }
                }} theme='dark' providers={[]} showLinks={false} view={currentviewin ? "sign_in" : "sign_up"} />
                <div className="flex justify-center mt-4">
                    <button className='underline decoration-blue-600' onClick={() => setcurrentviewin(!currentviewin)}>{currentviewin ? 'Нямаш акаунт? Регистрирай се тук' : 'Имаш акаунт? Влез тук'}</button>
                </div>
            </div>
        )
    } else {
        window.location.href = '/'
    }
}