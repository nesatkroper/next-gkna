import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Mail } from "lucide-react"
import Link from "next/link"

export default function AccountSuspendedPage() {
  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
            <AlertTriangle className="h-6 w-6 text-yellow-600" />
          </div>
          <CardTitle className="text-2xl">Account Suspended</CardTitle>
          <CardDescription>Your account has been temporarily suspended and cannot access the system.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-yellow-50 p-4">
            <h3 className="font-medium text-yellow-800">What does this mean?</h3>
            <ul className="mt-2 text-sm text-yellow-700">
              <li>• Your account access has been temporarily restricted</li>
              <li>• This may be due to security concerns or policy violations</li>
              <li>• Contact your administrator for more information</li>
            </ul>
          </div>

          <Button className="w-full" asChild>
            <Link href="mailto:admin@company.com">
              <Mail className="mr-2 h-4 w-4" />
              Contact Administrator
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
