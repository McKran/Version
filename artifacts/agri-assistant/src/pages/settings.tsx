import { Moon, Sun, Monitor, MapPin, Globe, Scale, Database, ChevronRight, RefreshCw, ShoppingCart, ClipboardList, Store, Truck } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useLocationStore } from "@/hooks/use-location";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/hooks/use-settings";
import { COUNTRIES, WEIGHT_UNIT_LABELS } from "@/lib/country-data";
import type { WeightUnit, TargetMarket } from "@/lib/country-data";
import { Badge } from "@/components/ui/badge";

function SettingsGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h2 className="text-xs font-bold text-muted-foreground ml-1 mb-2 uppercase tracking-wider">{title}</h2>
      <div className="bg-card border rounded-2xl overflow-hidden shadow-sm divide-y divide-border/50">
        {children}
      </div>
    </div>
  );
}

function SettingsRow({
  icon: Icon,
  label,
  description,
  value,
  control,
}: {
  icon: React.ElementType;
  label: string;
  description?: string;
  value?: React.ReactNode;
  control?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-card hover:bg-muted/20 transition-colors gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <div className="font-medium text-sm">{label}</div>
          {description && <div className="text-xs text-muted-foreground">{description}</div>}
        </div>
      </div>
      <div className="flex items-center gap-2 text-muted-foreground shrink-0">
        {value && <span className="text-sm">{value}</span>}
        {control ?? <ChevronRight className="h-4 w-4 opacity-40" />}
      </div>
    </div>
  );
}

export default function Settings() {
  const { location, setLocation } = useLocationStore();
  const { settings, updateSettings, setLanguage, resetOnboarding, t } = useSettings();
  const isFil = settings.language === "fil";

  const selectedCountry = COUNTRIES.find(c => c.code === settings.countryCode);
  const isDark = settings.theme === "dark" || (settings.theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  const handleCountryChange = (code: string) => {
    const country = COUNTRIES.find(c => c.code === code);
    updateSettings({ countryCode: code, currency: country?.currency ?? "USD" });
  };

  const marketModeDescription = isFil
    ? (settings.targetMarket === "international"
        ? "Ipinapakita ang mga pandaigdigang presyo bilang pangunahin"
        : settings.targetMarket === "regional"
        ? "Ipinapakita ang mga panrehiyong presyo sa merkado"
        : "Ipinapakita ang mga lokal na presyo sa bukid at pamilihan")
    : (settings.targetMarket === "international"
        ? "Showing international commodity benchmarks as primary price"
        : settings.targetMarket === "regional"
        ? "Showing regional market prices as primary benchmark"
        : "Showing local farmgate and market prices as primary");

  const unitDescription = isFil
    ? (settings.weightUnit === "gram"
        ? "Presyo bawat gramo (g) sa lahat ng pamilihan"
        : settings.weightUnit === "kilogram"
        ? "Presyo bawat kilo (kg) sa lahat ng pamilihan"
        : "Presyo bawat tonelada (MT) sa lahat ng pamilihan")
    : (settings.weightUnit === "gram"
        ? "Prices shown per gram across all market views"
        : settings.weightUnit === "kilogram"
        ? "Prices shown per kilogram across all market views"
        : "Prices shown per metric ton across all market views");

  return (
    <div className="max-w-2xl mx-auto space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          {isFil ? "Mga Setting" : "Settings"}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isFil ? "Pamahalaan ang iyong mga kagustuhan sa sakahan at karanasan sa app" : "Manage your farm preferences and app experience"}
        </p>
      </div>

      <SettingsGroup title={isFil ? "Profil ng Gumagamit" : "User Profile"}>
        <SettingsRow
          icon={Globe}
          label={isFil ? "Pangalan Mo" : "Your Name"}
          description={isFil ? "Gagamitin sa buong app para sa pagbati" : "Displayed throughout the app and greetings"}
          control={
            <Input
              value={settings.userName ?? ""}
              onChange={(e) => updateSettings({ userName: e.target.value })}
              className="h-8 w-44 text-right border-transparent bg-muted/50 focus-visible:bg-background text-sm font-medium"
              placeholder={isFil ? "Ilagay ang pangalan..." : "Enter name..."}
            />
          }
        />
      </SettingsGroup>

      <SettingsGroup title={isFil ? "Wika (Language)" : "Language"}>
        <SettingsRow
          icon={Globe}
          label={isFil ? "Wika ng App" : "App Language"}
          description={isFil ? "Pumili sa pagitan ng Ingles at Filipino (Tagalog)" : "Choose between English and Filipino (Tagalog)"}
          control={
            <Select value={settings.language} onValueChange={(v: any) => setLanguage(v)}>
              <SelectTrigger className="w-[170px] h-9 border-transparent bg-muted/60 font-medium text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">🇺🇸 English</SelectItem>
                <SelectItem value="fil">🇵🇭 Filipino (Tagalog)</SelectItem>
              </SelectContent>
            </Select>
          }
        />
      </SettingsGroup>

      <SettingsGroup title={isFil ? "Hitsura" : "Appearance"}>
        <SettingsRow
          icon={isDark ? Moon : Sun}
          label={isFil ? "Madilim na Tema (Dark Mode)" : "Dark Mode"}
          description={
            isDark
              ? (isFil ? "Aktibo ang madilim na tema" : "Dark theme active")
              : (isFil ? "Aktibo ang maliwanag na tema. Buksan upang i-enable ang dark mode." : "Default light theme active. Switch on to enable dark mode.")
          }
          control={
            <Switch
              checked={isDark}
              onCheckedChange={(checked) => updateSettings({ theme: checked ? "dark" : "light" })}
            />
          }
        />
        <SettingsRow
          icon={Monitor}
          label={isFil ? "Tema ng Kulay" : "Theme Mode"}
          description={isFil ? "Pumili ng gustong hitsura ng tema" : "Choose preferred theme mode"}
          control={
            <Select value={settings.theme} onValueChange={(v: any) => updateSettings({ theme: v })}>
              <SelectTrigger className="w-[120px] h-8 border-transparent bg-muted/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">{isFil ? "Maliwanag" : "Light Mode"}</SelectItem>
                <SelectItem value="dark">{isFil ? "Madilim" : "Dark Mode"}</SelectItem>
                <SelectItem value="system">{isFil ? "Sistema" : "System"}</SelectItem>
              </SelectContent>
            </Select>
          }
        />
      </SettingsGroup>

      <SettingsGroup title={isFil ? "Lokasyon at Rehiyon" : "Location & Region"}>
        <SettingsRow
          icon={MapPin}
          label={isFil ? "Lungsod / Bayan" : "City / Town"}
          description={isFil ? "Pinakamalapit na lungsod para sa panahon" : "Your nearest city for live weather"}
          control={
            <Input
              value={settings.cityName ?? ""}
              onChange={(e) => updateSettings({ cityName: e.target.value })}
              className="h-8 w-36 text-right border-transparent bg-muted/50 focus-visible:bg-background text-sm"
              placeholder={isFil ? "Ilagay ang lungsod..." : "Enter city..."}
            />
          }
        />
        <SettingsRow
          icon={MapPin}
          label={isFil ? "Rehiyon / Lalawigan" : "Region / Province"}
          description={isFil ? "Lalawigan o rehiyon" : "State, province, or region"}
          control={
            <Input
              value={settings.regionName ?? ""}
              onChange={(e) => updateSettings({ regionName: e.target.value })}
              className="h-8 w-36 text-right border-transparent bg-muted/50 focus-visible:bg-background text-sm"
              placeholder={isFil ? "Ilagay ang rehiyon..." : "Enter region..."}
            />
          }
        />
        <SettingsRow
          icon={Globe}
          label={isFil ? "Bansa" : "Country"}
          description={selectedCountry ? `${selectedCountry.currencyName} · ${selectedCountry.climate} climate` : undefined}
          control={
            <Select value={settings.countryCode} onValueChange={handleCountryChange}>
              <SelectTrigger className="w-[140px] h-8 border-transparent bg-muted/50">
                <SelectValue>
                  {selectedCountry ? `${selectedCountry.flag} ${selectedCountry.name}` : (isFil ? "Pumili ng bansa" : "Select country")}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {COUNTRIES.map(c => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.flag} {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          }
        />
        <SettingsRow
          icon={Globe}
          label={isFil ? "Pera / Salapi" : "Currency"}
          description={isFil ? "Kusa mula sa napiling bansa" : "Auto-set from country selection"}
          value={
            <Badge variant="secondary" className="bg-primary/10 text-primary font-mono text-xs">
              {selectedCountry?.currencySymbol} {settings.currency}
            </Badge>
          }
          control={<div />}
        />
        <SettingsRow
          icon={MapPin}
          label={isFil ? "Lokasyon ng Panahon" : "Weather Location"}
          description={isFil ? "Para sa mga tanong sa panahon" : "Override for weather queries"}
          control={
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="h-8 w-36 text-right border-transparent bg-muted/50 focus-visible:bg-background text-sm"
            />
          }
        />
      </SettingsGroup>

      <SettingsGroup title={isFil ? "Merkado at Presyo" : "Market & Pricing"}>
        <SettingsRow
          icon={Scale}
          label={isFil ? "Kaugaliang Timbang" : "Default Weight Unit"}
          description={unitDescription}
          control={
            <Select
              value={settings.weightUnit}
              onValueChange={(v: WeightUnit) => updateSettings({ weightUnit: v })}
            >
              <SelectTrigger className="w-[150px] h-8 border-transparent bg-muted/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gram">{isFil ? "Bawat gramo (g)" : "Per gram (g)"}</SelectItem>
                <SelectItem value="kilogram">{isFil ? "Bawat kilo (kg)" : "Per kilogram (kg)"}</SelectItem>
                <SelectItem value="metric_ton">{isFil ? "Bawat tonelada (MT)" : "Per metric ton (MT)"}</SelectItem>
              </SelectContent>
            </Select>
          }
        />
        <SettingsRow
          icon={ShoppingCart}
          label={isFil ? "Inaasahang Merkado" : "Target Market"}
          description={marketModeDescription}
          control={
            <Select
              value={settings.targetMarket}
              onValueChange={(v: TargetMarket) => updateSettings({ targetMarket: v })}
            >
              <SelectTrigger className="w-[150px] h-8 border-transparent bg-muted/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="local">{isFil ? "Lokal na Pamilihan" : "Local Market"}</SelectItem>
                <SelectItem value="regional">{isFil ? "Panrehiyon" : "Regional"}</SelectItem>
                <SelectItem value="international">{isFil ? "Pandaigdigan" : "International"}</SelectItem>
              </SelectContent>
            </Select>
          }
        />
      </SettingsGroup>

      <SettingsGroup title={isFil ? "Mga Anino sa Marketplace (Grownox Addresses)" : "Grownox Marketplace Addresses"}>
        <div className="p-4 space-y-4">
          {/* Farmer / Seller Address */}
          <div className="space-y-2 border-b border-border/50 pb-4">
            <div className="flex items-center gap-2">
              <Store className="h-4 w-4 text-amber-600" />
              <h3 className="font-bold text-sm text-foreground">
                {isFil ? "Anino ng Magsasaka (Seller Address)" : "Farmer / Seller Default Address"}
              </h3>
            </div>
            <p className="text-xs text-muted-foreground">
              {isFil ? "Gagamiting default sa pagpo-post ng mga pananim sa Grownox Marketplace" : "Used as default location when creating crop listings"}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase">{isFil ? "Rehiyon" : "Region"}</label>
                <Input
                  value={settings.savedSellerAddress?.region || ""}
                  onChange={(e) =>
                    updateSettings({
                      savedSellerAddress: {
                        ...(settings.savedSellerAddress || {
                          region: "Davao Region",
                          province: "Davao Oriental",
                          municipality: "Mati City",
                          barangay: "Central",
                          streetAddress: "",
                        }),
                        region: e.target.value,
                      },
                    })
                  }
                  className="h-8 text-xs bg-muted/30"
                  placeholder="e.g. Davao Region"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase">{isFil ? "Lalawigan" : "Province"}</label>
                <Input
                  value={settings.savedSellerAddress?.province || ""}
                  onChange={(e) =>
                    updateSettings({
                      savedSellerAddress: {
                        ...(settings.savedSellerAddress || {
                          region: "Davao Region",
                          province: "Davao Oriental",
                          municipality: "Mati City",
                          barangay: "Central",
                          streetAddress: "",
                        }),
                        province: e.target.value,
                      },
                    })
                  }
                  className="h-8 text-xs bg-muted/30"
                  placeholder="e.g. Davao Oriental"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase">{isFil ? "Lungsod / Bayan" : "City / Municipality"}</label>
                <Input
                  value={settings.savedSellerAddress?.municipality || ""}
                  onChange={(e) =>
                    updateSettings({
                      savedSellerAddress: {
                        ...(settings.savedSellerAddress || {
                          region: "Davao Region",
                          province: "Davao Oriental",
                          municipality: "Mati City",
                          barangay: "Central",
                          streetAddress: "",
                        }),
                        municipality: e.target.value,
                      },
                    })
                  }
                  className="h-8 text-xs bg-muted/30"
                  placeholder="e.g. Mati City"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Barangay</label>
                <Input
                  value={settings.savedSellerAddress?.barangay || ""}
                  onChange={(e) =>
                    updateSettings({
                      savedSellerAddress: {
                        ...(settings.savedSellerAddress || {
                          region: "Davao Region",
                          province: "Davao Oriental",
                          municipality: "Mati City",
                          barangay: "",
                          streetAddress: "",
                        }),
                        barangay: e.target.value,
                      },
                    })
                  }
                  className="h-8 text-xs bg-muted/30"
                  placeholder="e.g. Central"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">{isFil ? "Kalye / Tirahan" : "Street / Address"}</label>
                <Input
                  value={settings.savedSellerAddress?.streetAddress || ""}
                  onChange={(e) =>
                    updateSettings({
                      savedSellerAddress: {
                        ...(settings.savedSellerAddress || {
                          region: "Davao Region",
                          province: "Davao Oriental",
                          municipality: "Mati City",
                          barangay: "Central",
                          streetAddress: "",
                        }),
                        streetAddress: e.target.value,
                      },
                    })
                  }
                  className="h-8 text-xs bg-muted/30"
                  placeholder="e.g. Example Street"
                />
              </div>
            </div>
          </div>

          {/* Buyer Delivery Address */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-emerald-600" />
              <h3 className="font-bold text-sm text-foreground">
                {isFil ? "Anino ng Mamimili (Buyer Delivery Address)" : "Buyer Saved Delivery Address"}
              </h3>
            </div>
            <p className="text-xs text-muted-foreground">
              {isFil ? "Gagamitin sa mga order para sa mabilisang checkout" : "Saved delivery address used for quick checkout on orders"}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase">{isFil ? "Rehiyon" : "Region"}</label>
                <Input
                  value={settings.savedBuyerAddress?.region || ""}
                  onChange={(e) =>
                    updateSettings({
                      savedBuyerAddress: {
                        ...(settings.savedBuyerAddress || {
                          region: "Davao Region",
                          province: "Davao Oriental",
                          municipality: "Mati City",
                          barangay: "Central",
                          streetAddress: "",
                        }),
                        region: e.target.value,
                      },
                    })
                  }
                  className="h-8 text-xs bg-muted/30"
                  placeholder="e.g. Davao Region"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase">{isFil ? "Lalawigan" : "Province"}</label>
                <Input
                  value={settings.savedBuyerAddress?.province || ""}
                  onChange={(e) =>
                    updateSettings({
                      savedBuyerAddress: {
                        ...(settings.savedBuyerAddress || {
                          region: "Davao Region",
                          province: "Davao Oriental",
                          municipality: "Mati City",
                          barangay: "Central",
                          streetAddress: "",
                        }),
                        province: e.target.value,
                      },
                    })
                  }
                  className="h-8 text-xs bg-muted/30"
                  placeholder="e.g. Davao Oriental"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase">{isFil ? "Lungsod / Bayan" : "City / Municipality"}</label>
                <Input
                  value={settings.savedBuyerAddress?.municipality || ""}
                  onChange={(e) =>
                    updateSettings({
                      savedBuyerAddress: {
                        ...(settings.savedBuyerAddress || {
                          region: "Davao Region",
                          province: "Davao Oriental",
                          municipality: "Mati City",
                          barangay: "Central",
                          streetAddress: "",
                        }),
                        municipality: e.target.value,
                      },
                    })
                  }
                  className="h-8 text-xs bg-muted/30"
                  placeholder="e.g. Mati City or Butuan City"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Barangay</label>
                <Input
                  value={settings.savedBuyerAddress?.barangay || ""}
                  onChange={(e) =>
                    updateSettings({
                      savedBuyerAddress: {
                        ...(settings.savedBuyerAddress || {
                          region: "Davao Region",
                          province: "Davao Oriental",
                          municipality: "Mati City",
                          barangay: "",
                          streetAddress: "",
                        }),
                        barangay: e.target.value,
                      },
                    })
                  }
                  className="h-8 text-xs bg-muted/30"
                  placeholder="e.g. Central"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">{isFil ? "Kalye / Tirahan" : "Street / Address"}</label>
                <Input
                  value={settings.savedBuyerAddress?.streetAddress || ""}
                  onChange={(e) =>
                    updateSettings({
                      savedBuyerAddress: {
                        ...(settings.savedBuyerAddress || {
                          region: "Davao Region",
                          province: "Davao Oriental",
                          municipality: "Mati City",
                          barangay: "Central",
                          streetAddress: "",
                        }),
                        streetAddress: e.target.value,
                      },
                    })
                  }
                  className="h-8 text-xs bg-muted/30"
                  placeholder="e.g. Example Street"
                />
              </div>
            </div>
          </div>
        </div>
      </SettingsGroup>

      <SettingsGroup title={isFil ? "Mga Nais na Pananim" : "Preferred Crops"}>
        <div className="p-4">
          {settings.preferredCrops.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {isFil ? "Walang napiling pananim. Isagawa muli ang setup upang pumili." : "No preferred crops selected. Re-run setup to configure."}
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {settings.preferredCrops.map(crop => (
                <Badge key={crop} variant="secondary" className="bg-primary/10 text-primary text-xs px-3 py-1">
                  {crop}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </SettingsGroup>

      <SettingsGroup title={isFil ? "Plano sa Pagsasaka" : "Farming Plan"}>
        <SettingsRow
          icon={ClipboardList}
          label={isFil ? "Katalinuhan ng Plano" : "Plan Intelligence"}
          description={
            isFil
              ? "Pinapagana ng live Open-Meteo datos ng panahon at beripikadong siklo ng paglaki ng pananim"
              : "Powered by live Open-Meteo weather data and verified crop growth cycles"
          }
          value={
            <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
              {isFil ? "Totoong Datos" : "Live Data"}
            </Badge>
          }
          control={<div />}
        />
        <SettingsRow
          icon={Database}
          label={isFil ? "Agwat ng Pag-refresh ng Datos" : "Data Refresh Interval"}
          value={isFil ? "Bawat 15 minuto" : "Every 15 minutes"}
          control={<div />}
        />
      </SettingsGroup>

      <SettingsGroup title={isFil ? "Pagsasaayos (Setup)" : "Setup"}>
        <div className="p-4">
          <p className="text-sm text-muted-foreground mb-3">
            {isFil
              ? "Patakbuhin muli ang setup wizard upang muling isaayos ang iyong bansa, pananim, at pamilihan."
              : "Re-run the onboarding wizard to reconfigure your country, crops, and market setup from scratch."}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={resetOnboarding}
            className="gap-2 text-primary border-primary/30 hover:bg-primary/5"
          >
            <RefreshCw className="h-4 w-4" />
            {isFil ? "Patakbuhin Muli ang Setup Wizard" : "Re-run Setup Wizard"}
          </Button>
        </div>
      </SettingsGroup>
    </div>
  );
}
