import type { NextPage } from "next"
import JwtForm from "./components/JwtForm"


const Dashboard: NextPage = async () => {


  return (
    <div>
      <JwtForm />
    </div>
  )
}

export default Dashboard