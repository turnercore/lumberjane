import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import Link from "next/link"

export default function Home() {

  return (
    <div className="container mx-auto px-4">
      {/* Hero Section */}
      <Card className="p-2 text-center">
        <CardHeader>
          <CardTitle className='text-4xl font-bold'>Welcome to Lumberjane!</CardTitle>
          <CardDescription> Lumberjane is a tool for securely storing and accessing your API keys.</CardDescription>
        </CardHeader>
        <CardContent>
          <h2>
            Don&rsquot expose your API keys in your gamejam or small project, Lumberjane offers a simple solution for storing, managing, accessing, and logging your API keys to make sure they aren&rsquot abused.
          </h2>
          <br />
          <Link href="/login">
            <Button className="hover:scale-125 hover:shadow active:shadow-inner active:scale-100 text-lg" size='lg'>Get Started</Button>
          </Link>
        </CardContent>
      </Card>

      {/* Features Section */}
      <section className="p-8 flex-wrap">
        <h2 className="text-2xl font-bold mb-4">Features</h2>
        <div className="grid grid-cols-3 gap-4">
          <Card className="">
            <CardHeader>
              <CardTitle>Securely store your API keys.</CardTitle>
              <CardDescription>Perfect for small projects and gamejam games!</CardDescription>
            </CardHeader>
            <CardContent>
              <p> Does your small project or game use third party API keys? Don&rsquot ship your keys with your app! </p>
            </CardContent>
          </Card>
          <Card className="">
            <CardHeader>
              <CardTitle>Control, restrict, and revoke access</CardTitle>
              <CardDescription>Restrict access to your keys by IP Address, Time of Day, or set an Expiration.</CardDescription>
            </CardHeader>
            <CardContent>
              <p> Lots of different ways to craft your Lumberjane tokens ensure your keys are being used responsibly.</p>
            </CardContent>
          </Card>
          <Card className="">
            <CardHeader>
              <CardTitle>Get back only the data you expect</CardTitle>
              <CardDescription>Setting an optional return schema with your token allows you to only get the data back that you want.</CardDescription>
            </CardHeader>
            <CardContent>
              <p> Use AI to validate reponses to make sure you&rsquore getting the data you expect.</p>
            </CardContent>
          </Card>
          <Card className="">
            <CardHeader>
              <CardTitle>Created with Next.js 13 & Supabase</CardTitle>
              <CardDescription>Using modern web technology, Lumberjane should scale to whatever you need it to.</CardDescription>
            </CardHeader>
            <CardContent>
              <p> Lumberjane was built with Next.js 13 and Supabase, but feel free to self-host it in a Docker container or on Vercel yourself. </p>
            </CardContent>
          </Card>
          <Card className="">
            <CardHeader>
              <CardTitle>Open Source</CardTitle>
              <CardDescription>Our free tier hosting is great to try out the service.</CardDescription>
            </CardHeader>
            <CardContent>
              <p> Lumberjane is open source, so you can self-host it, or contribute to the project by opening a pull request or upgrading to Supporter tier.</p>
            </CardContent>
          </Card>
          <Card className="">
            <CardHeader>
              <CardTitle>Self-Host</CardTitle>
              <CardDescription>Our free tier hosting is great to try out the service.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Use the free tier for small apps, personal projects or gamejame games. If your project gets a lot of traffic upgrade to Supporter, or self-host Lumberjane for free.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Testimonials Section */}
      {/* <section className="p-8">
        <h2 className="text-2xl font-bold mb-4">What our users say</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="">
            <p className="text-lg mt-2">&ldquoThis app is amazing!&rdquo</p>
            <p className="text-sm text-gray-500">- John Doe</p>
          </div>
        </div>
      </section> */}
    </div>
  )
}
