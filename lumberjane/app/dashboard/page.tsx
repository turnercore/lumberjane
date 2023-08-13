import type { NextPage } from "next"
import { JwtForm } from "./components/JwtForm"


const Dashboard: NextPage = async () => {


  return (
    <div>
      <h4>Dashboard</h4>
      <JwtForm />
    </div>
  )
}

export default Dashboard