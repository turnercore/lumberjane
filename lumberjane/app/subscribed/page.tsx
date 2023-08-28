
type ExpectedSearchParams = {
  success? : boolean,
  canceled? : boolean,
  session_id? : string
}

export default function SubscribedPage({searchParams} : {searchParams: ExpectedSearchParams}) {
  if (searchParams.success) {
    return (
    <div>Subscription successful! Session ID: {searchParams.session_id || 'session_id not found'}</div>
    )
  }

  if (searchParams.canceled) {
    return <div>Subscription was canceled.</div>
  }

  return <div>Something went wrong.</div>
}