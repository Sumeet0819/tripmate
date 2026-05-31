import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useTheme } from "../../utils/theme";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import Icon from "react-native-remix-icon";
import { OrganicHeader } from "../../components/OrganicHeader";
import { MetricCard } from "../../components/MetricCard";
import { AnalyticsChartCard } from "../../components/AnalyticsChartCard";

export default function HomeScreen() {
  const { colors, mode } = useTheme();
  const [search, setSearch] = useState("");

  // Grid Summary Metrics mapped from travel planner content
  const summaryCards = [
    {
      id: "1",
      title: "Total Trips",
      value: "128",
      change: "+12 vs last month",
      percent: "+9.4%",
      isPositive: true,
      icon: "compass-3-line",
      circleBg: mode === "light" ? "#FEF3C7" : "#342610",
      iconColor: mode === "light" ? "#D97706" : "#F59E0B",
    },
    {
      id: "2",
      title: "Active Platoons",
      value: "8",
      change: "-1 vs last month",
      percent: "-5.2%",
      isPositive: false,
      icon: "team-line",
      circleBg: mode === "light" ? "#FFEDD5" : "#3B1E10",
      iconColor: mode === "light" ? "#EA580C" : "#F97316",
    },
    {
      id: "3",
      title: "Saved Budget",
      value: "₹48,250",
      change: "+₹4,200 vs last month",
      percent: "+6.8%",
      isPositive: true,
      icon: "wallet-line",
      circleBg: mode === "light" ? "#DBEAFE" : "#1E293B",
      iconColor: mode === "light" ? "#2563EB" : "#3B82F6",
    },
    {
      id: "4",
      title: "Completed",
      value: "42",
      change: "-2 vs last month",
      percent: "-3.1%",
      isPositive: false,
      icon: "send-plane-line",
      circleBg: mode === "light" ? "#D1FAE5" : "#064E3B",
      iconColor: mode === "light" ? "#059669" : "#10B981",
    }
  ] as const;

  return (
    <View 
      className="flex-1"
      style={{ backgroundColor: "#072D1B" }} // Deep forest green outer backplate
    >
      <StatusBar style={mode === "light" ? "dark" : "light"} />

      {/* Premium Mockup Organic Header Navbar */}
      <OrganicHeader
        search={search}
        onSearchChange={setSearch}
      />

      {/* Main Screen Body Scroll Container with Curved sliding panel */}
      <ScrollView 
        className="flex-1"
        style={{
          backgroundColor: mode === "light" ? "#EFF2EE" : "#0E1013",
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
          marginTop: -8, // Panel overlap cutout under organic header
        }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
      >
        {/* Page Title Dashboard & Plan New Trip Action Button */}
        <View className="px-6 mt-6 flex-row justify-between items-center">
          <Text 
            className="text-2xl font-extrabold tracking-tight"
            style={{ 
              fontFamily: "Montserrat", 
              color: mode === "light" ? "#072D1B" : "#FFFFFF" 
            }}
          >
            Dashboard
          </Text>

          {/* "+ Plan New Trip" filled CTA matching mockup layout */}
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#1E5E3D",
              paddingVertical: 10,
              paddingHorizontal: 16,
              borderRadius: 24,
              gap: 4,
            }}
            activeOpacity={0.8}
          >
            <Icon name="add-line" size={16} color="#FFFFFF" />
            <Text 
              className="text-xs font-bold text-white" 
              style={{ fontFamily: "Montserrat" }}
            >
              Plan New Trip
            </Text>
          </TouchableOpacity>
        </View>

        {/* 2x2 summary metrics grid */}
        <View className="px-6 mt-6 gap-y-6">
          {/* Row 1 */}
          <View className="flex-row justify-between w-full">
            {summaryCards.slice(0, 2).map((card) => (
              <MetricCard
                key={card.id}
                title={card.title}
                value={card.value}
                change={card.change}
                percent={card.percent}
                isPositive={card.isPositive}
                icon={card.icon}
                iconColor={card.iconColor}
                circleBg={card.circleBg}
              />
            ))}
          </View>

          {/* Row 2 */}
          <View className="flex-row justify-between w-full">
            {summaryCards.slice(2, 4).map((card) => (
              <MetricCard
                key={card.id}
                title={card.title}
                value={card.value}
                change={card.change}
                percent={card.percent}
                isPositive={card.isPositive}
                icon={card.icon}
                iconColor={card.iconColor}
                circleBg={card.circleBg}
              />
            ))}
          </View>
        </View>

        {/* Travel Analytics Card Section */}
        <View className="px-6 mt-6">
          <AnalyticsChartCard
            title="Travel Analytics"
            rateValue="0.78%"
            ratePercent="16%"
            deliveryValue="4,652"
            deliveryPercent="0.6%"
          />
        </View>
      </ScrollView>
    </View>
  );
}
