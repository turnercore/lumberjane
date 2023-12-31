import {
  Card,
  CardHeader,
  CardContent,
} from "@/components/ui"
import type { TokenData } from '@/types'
import TokenTable from '../components/TokenTable'
import { fetchDeletedTokens } from '../utils/utils'

const DeletedTokensDashboard = async () => {
  const tokenData = await fetchDeletedTokens()
  const tokens: TokenData[] = tokenData ? tokenData : []

  return (
    <Card className="mx-auto max-w-5xl mb-20 p-3 shadow-md">
      <CardHeader className='text-center'>
        <h1 className="text-2xl font-bold">Your Deleted Tokens</h1>
      </CardHeader>
      <CardContent>
        <TokenTable passedTokens={tokens} />
      </CardContent>
    </Card>
  )
}

export default DeletedTokensDashboard
