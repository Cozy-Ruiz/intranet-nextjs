import React, { FC, PropsWithChildren } from 'react'
//import "./styles/globals.css"

const Escritoriolayout: FC<PropsWithChildren> = ({children}) => {
  return (
    <html>
        <body>{children}</body>
    </html>
  )
}

export default Escritoriolayout