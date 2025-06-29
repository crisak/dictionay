import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@repo/mobile-ui/components/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/mobile-ui/components/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/mobile-ui/components/tabs'
import { Badge } from '@repo/mobile-ui/components/badge'
import {
  CheckCircle,
  CreditCard,
  CloudIcon as CloudSync,
  FileSpreadsheet,
  Zap,
  Smartphone,
} from 'lucide-react'
import { getTranslations } from 'next-intl/server'

export default async function LandingPage() {
  const t = await getTranslations('landing')

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 px-24">
            <CreditCard className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">{t('brand')}</span>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link href="#features" className="text-sm font-medium hover:text-primary">
              {t('nav.features')}
            </Link>
            <Link href="#technology" className="text-sm font-medium hover:text-primary">
              {t('nav.technology')}
            </Link>
            <Link href="#pricing" className="text-sm font-medium hover:text-primary">
              {t('nav.pricing')}
            </Link>
            <Link href="#roadmap" className="text-sm font-medium hover:text-primary">
              {t('nav.roadmap')}
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium hover:underline underline-offset-4"
            >
              {t('nav.signIn')}
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium shadow-sm hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 text-black"
            >
              {t('nav.getStarted')}
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full px-24 py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-background to-muted">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <Badge variant="outline" className="inline-flex">
                    {t('hero.badge')}
                  </Badge>
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    {t('hero.title')}
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    {t('hero.subtitle')}
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg" className="h-12">
                    {t('hero.startTrial')}
                  </Button>
                  <Button size="lg" variant="outline" className="h-12">
                    {t('hero.viewDemo')}
                  </Button>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4" />
                  <span>{t('hero.noCard')}</span>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative aspect-video overflow-hidden rounded-xl border bg-background shadow-xl">
                  <Image
                    src="/placeholder.svg?height=720&width=1280"
                    width={1280}
                    height={720}
                    alt="App screenshot"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Key Differentiators */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-background" id="features">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  {t('features.title')}
                </h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  {t('features.subtitle')}
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <FileSpreadsheet className="h-6 w-6 text-primary" />
                  <CardTitle className="mt-2">{t('features.sheets')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {t('features.sheetsDesc')}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <Smartphone className="h-6 w-6 text-primary" />
                  <CardTitle className="mt-2">{t('features.pwa')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{t('features.pwaDesc')}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CloudSync className="h-6 w-6 text-primary" />
                  <CardTitle className="mt-2">{t('features.offline')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {t('features.offlineDesc')}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <Zap className="h-6 w-6 text-primary" />
                  <CardTitle className="mt-2">{t('features.multimodal')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {t('features.multimodalDesc')}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Feature Tabs */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  {t('tabs.title')}
                </h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  {t('tabs.subtitle')}
                </p>
              </div>
            </div>
            <div className="mx-auto max-w-3xl py-12">
              <Tabs defaultValue="core" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="core">{t('tabs.core')}</TabsTrigger>
                  <TabsTrigger value="enhanced">{t('tabs.enhanced')}</TabsTrigger>
                  <TabsTrigger value="advanced">{t('tabs.advanced')}</TabsTrigger>
                </TabsList>
                <TabsContent value="core" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('tabs.coreTitle')}</CardTitle>
                      <CardDescription>{t('tabs.coreDesc')}</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6 md:grid-cols-2">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="mt-1 h-5 w-5 text-primary" />
                        <div>
                          <h3 className="font-medium">
                            {t('coreFeatures.transactions')}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {t('coreFeatures.transactionsDesc')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="mt-1 h-5 w-5 text-primary" />
                        <div>
                          <h3 className="font-medium">{t('coreFeatures.sync')}</h3>
                          <p className="text-sm text-muted-foreground">
                            {t('coreFeatures.syncDesc')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="mt-1 h-5 w-5 text-primary" />
                        <div>
                          <h3 className="font-medium">{t('coreFeatures.auth')}</h3>
                          <p className="text-sm text-muted-foreground">
                            {t('coreFeatures.authDesc')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="mt-1 h-5 w-5 text-primary" />
                        <div>
                          <h3 className="font-medium">{t('coreFeatures.dashboard')}</h3>
                          <p className="text-sm text-muted-foreground">
                            {t('coreFeatures.dashboardDesc')}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="enhanced" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('tabs.enhancedTitle')}</CardTitle>
                      <CardDescription>{t('tabs.enhancedDesc')}</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6 md:grid-cols-2">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="mt-1 h-5 w-5 text-primary" />
                        <div>
                          <h3 className="font-medium">{t('enhancedFeatures.import')}</h3>
                          <p className="text-sm text-muted-foreground">
                            {t('enhancedFeatures.importDesc')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="mt-1 h-5 w-5 text-primary" />
                        <div>
                          <h3 className="font-medium">{t('enhancedFeatures.offline')}</h3>
                          <p className="text-sm text-muted-foreground">
                            {t('enhancedFeatures.offlineDesc')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="mt-1 h-5 w-5 text-primary" />
                        <div>
                          <h3 className="font-medium">
                            {t('enhancedFeatures.analytics')}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {t('enhancedFeatures.analyticsDesc')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="mt-1 h-5 w-5 text-primary" />
                        <div>
                          <h3 className="font-medium">{t('enhancedFeatures.pwa')}</h3>
                          <p className="text-sm text-muted-foreground">
                            {t('enhancedFeatures.pwaDesc')}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="advanced" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('tabs.advancedTitle')}</CardTitle>
                      <CardDescription>{t('tabs.advancedDesc')}</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6 md:grid-cols-2">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="mt-1 h-5 w-5 text-primary" />
                        <div>
                          <h3 className="font-medium">{t('advancedFeatures.ocr')}</h3>
                          <p className="text-sm text-muted-foreground">
                            {t('advancedFeatures.ocrDesc')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="mt-1 h-5 w-5 text-primary" />
                        <div>
                          <h3 className="font-medium">{t('advancedFeatures.voice')}</h3>
                          <p className="text-sm text-muted-foreground">
                            {t('advancedFeatures.voiceDesc')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="mt-1 h-5 w-5 text-primary" />
                        <div>
                          <h3 className="font-medium">
                            {t('advancedFeatures.categories')}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {t('advancedFeatures.categoriesDesc')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="mt-1 h-5 w-5 text-primary" />
                        <div>
                          <h3 className="font-medium">{t('advancedFeatures.budget')}</h3>
                          <p className="text-sm text-muted-foreground">
                            {t('advancedFeatures.budgetDesc')}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </section>

        {/* Technology Stack */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-background" id="technology">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  {t('technology.title')}
                </h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  {t('technology.subtitle')}
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 py-12 md:grid-cols-3 lg:grid-cols-4">
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-4">
                <div className="rounded-full bg-primary/10 p-2">
                  <div className="h-6 w-6 text-primary">N</div>
                </div>
                <h3 className="text-center text-sm font-medium">Next.js 14</h3>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-4">
                <div className="rounded-full bg-primary/10 p-2">
                  <div className="h-6 w-6 text-primary">R</div>
                </div>
                <h3 className="text-center text-sm font-medium">React 18</h3>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-4">
                <div className="rounded-full bg-primary/10 p-2">
                  <div className="h-6 w-6 text-primary">T</div>
                </div>
                <h3 className="text-center text-sm font-medium">TypeScript</h3>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-4">
                <div className="rounded-full bg-primary/10 p-2">
                  <div className="h-6 w-6 text-primary">TW</div>
                </div>
                <h3 className="text-center text-sm font-medium">Tailwind CSS</h3>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-4">
                <div className="rounded-full bg-primary/10 p-2">
                  <div className="h-6 w-6 text-primary">RQ</div>
                </div>
                <h3 className="text-center text-sm font-medium">React Query</h3>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-4">
                <div className="rounded-full bg-primary/10 p-2">
                  <div className="h-6 w-6 text-primary">SF</div>
                </div>
                <h3 className="text-center text-sm font-medium">Serverless</h3>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-4">
                <div className="rounded-full bg-primary/10 p-2">
                  <div className="h-6 w-6 text-primary">NA</div>
                </div>
                <h3 className="text-center text-sm font-medium">NextAuth.js</h3>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-4">
                <div className="rounded-full bg-primary/10 p-2">
                  <div className="h-6 w-6 text-primary">WB</div>
                </div>
                <h3 className="text-center text-sm font-medium">Workbox</h3>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted" id="pricing">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  {t('pricing.title')}
                </h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  {t('pricing.subtitle')}
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>{t('pricing.free')}</CardTitle>
                  <CardDescription>{t('pricing.freeDesc')}</CardDescription>
                  <div className="mt-4 text-4xl font-bold">{t('pricing.freePrice')}</div>
                  <p className="text-sm text-muted-foreground">{t('pricing.freeFreq')}</p>
                </CardHeader>
                <CardContent>
                  <ul className="grid gap-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>{t('pricingFeatures.free.core')}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>{t('pricingFeatures.free.transactions')}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>{t('pricingFeatures.free.dashboard')}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>{t('pricingFeatures.free.sheets')}</span>
                    </li>
                  </ul>
                  <Button className="mt-6 w-full">{t('pricing.getStarted')}</Button>
                </CardContent>
              </Card>
              <Card className="border-primary">
                <CardHeader>
                  <Badge className="absolute right-4 top-4">{t('pricing.popular')}</Badge>
                  <CardTitle>{t('pricing.premium')}</CardTitle>
                  <CardDescription>{t('pricing.premiumDesc')}</CardDescription>
                  <div className="mt-4 text-4xl font-bold">
                    {t('pricing.premiumPrice')}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t('pricing.premiumFreq')}
                  </p>
                </CardHeader>
                <CardContent>
                  <ul className="grid gap-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>{t('pricingFeatures.premium.free')}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>{t('pricingFeatures.premium.unlimited')}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>{t('pricingFeatures.premium.analytics')}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>{t('pricingFeatures.premium.import')}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>{t('pricingFeatures.premium.offline')}</span>
                    </li>
                  </ul>
                  <Button className="mt-6 w-full">{t('pricing.startTrial')}</Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>{t('pricing.business')}</CardTitle>
                  <CardDescription>{t('pricing.businessDesc')}</CardDescription>
                  <div className="mt-4 text-4xl font-bold">
                    {t('pricing.businessPrice')}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t('pricing.businessFreq')}
                  </p>
                </CardHeader>
                <CardContent>
                  <ul className="grid gap-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>{t('pricingFeatures.business.premium')}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>{t('pricingFeatures.business.multiuser')}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>{t('pricingFeatures.business.ai')}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>{t('pricingFeatures.business.support')}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>{t('pricingFeatures.business.reporting')}</span>
                    </li>
                  </ul>
                  <Button className="mt-6 w-full">{t('pricing.contactSales')}</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Roadmap */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-background" id="roadmap">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  {t('roadmap.title')}
                </h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  {t('roadmap.subtitle')}
                </p>
              </div>
            </div>
            <div className="mx-auto max-w-3xl py-12">
              <div className="relative">
                <div className="absolute left-8 top-0 h-full w-px bg-border md:left-1/2"></div>
                <div className="grid gap-8">
                  <div className="flex flex-col gap-2 md:grid md:grid-cols-2 md:gap-4">
                    <div className="flex md:justify-end">
                      <div className="flex items-center gap-2 md:flex-row-reverse">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <span className="font-bold">P0</span>
                        </div>
                        <div className="hidden h-px w-8 bg-border md:block"></div>
                      </div>
                    </div>
                    <div className="rounded-lg border bg-card p-4 text-card-foreground shadow">
                      <h3 className="font-bold">{t('roadmap.core')}</h3>
                      <p className="text-sm text-muted-foreground">
                        {t('roadmap.coreDesc')}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 md:grid md:grid-cols-2 md:gap-4">
                    <div className="order-2 md:order-1 rounded-lg border bg-card p-4 text-card-foreground shadow">
                      <h3 className="font-bold">{t('roadmap.enhanced')}</h3>
                      <p className="text-sm text-muted-foreground">
                        {t('roadmap.enhancedDesc')}
                      </p>
                    </div>
                    <div className="order-1 md:order-2 flex">
                      <div className="flex items-center gap-2">
                        <div className="hidden h-px w-8 bg-border md:block"></div>
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/80 text-primary-foreground">
                          <span className="font-bold">P1-2</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 md:grid md:grid-cols-2 md:gap-4">
                    <div className="flex md:justify-end">
                      <div className="flex items-center gap-2 md:flex-row-reverse">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/60 text-primary-foreground">
                          <span className="font-bold">P3-4</span>
                        </div>
                        <div className="hidden h-px w-8 bg-border md:block"></div>
                      </div>
                    </div>
                    <div className="rounded-lg border bg-card p-4 text-card-foreground shadow">
                      <h3 className="font-bold">{t('roadmap.advanced')}</h3>
                      <p className="text-sm text-muted-foreground">
                        {t('roadmap.advancedDesc')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-primary text-primary-foreground">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  {t('cta.title')}
                </h2>
                <p className="mx-auto max-w-[700px] md:text-xl">{t('cta.subtitle')}</p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button
                  size="lg"
                  className="h-12 bg-background text-primary hover:bg-background/90"
                >
                  {t('cta.startTrial')}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 border-background text-background hover:bg-primary/90 hover:text-background"
                >
                  {t('cta.learnMore')}
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  {t('testimonials.title')}
                </h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  {t('testimonials.subtitle')}
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Image
                      src="/placeholder.svg?height=40&width=40"
                      width={40}
                      height={40}
                      alt="User avatar"
                      className="rounded-full"
                    />
                    <div>
                      <h3 className="font-bold">{t('testimonials.user1.name')}</h3>
                      <p className="text-sm text-muted-foreground">
                        {t('testimonials.user1.type')}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm">&quot;{t('testimonials.user1.quote')}&quot;</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Image
                      src="/placeholder.svg?height=40&width=40"
                      width={40}
                      height={40}
                      alt="User avatar"
                      className="rounded-full"
                    />
                    <div>
                      <h3 className="font-bold">{t('testimonials.user2.name')}</h3>
                      <p className="text-sm text-muted-foreground">
                        {t('testimonials.user2.type')}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm">&quot;{t('testimonials.user2.quote')}&quot;</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Image
                      src="/placeholder.svg?height=40&width=40"
                      width={40}
                      height={40}
                      alt="User avatar"
                      className="rounded-full"
                    />
                    <div>
                      <h3 className="font-bold">{t('testimonials.user3.name')}</h3>
                      <p className="text-sm text-muted-foreground">
                        {t('testimonials.user3.type')}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm">&quot;{t('testimonials.user3.quote')}&quot;</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full border-t bg-background">
        <div className="container px-24 flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
          <div className="flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">{t('brand')}</span>
          </div>
          <p className="text-center text-sm text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} {t('brand')}. {t('footer.rights')}
          </p>
          <div className="flex gap-4">
            <Link
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {t('footer.terms')}
            </Link>
            <Link
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {t('footer.privacy')}
            </Link>
            <Link
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {t('footer.contact')}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
