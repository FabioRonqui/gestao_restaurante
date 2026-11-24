import { Fragment, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import Svg, { Circle, Path, Rect, Text as SvgText } from 'react-native-svg';
import {
  Activity,
  Banknote,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  CreditCard,
  Package,
  RefreshCw,
  ShoppingBag,
  Star,
  TrendingDown,
  TrendingUp,
  UsersRound,
  Wallet,
  XCircle,
} from 'lucide-react-native';

import { formatPrice } from '../../products/utils/formatPrice';
import type { Product } from '../../products/types/product';
import { getStaffOrdersInRange } from '../staffService';
import type { StaffOrder, StaffSession } from '../types';

type Props = {
  session: StaffSession;
  products: Product[];
};

type PeriodId = 'today' | 'yesterday' | 'last7' | 'last30' | 'thisMonth' | 'lastMonth' | 'thisYear' | 'custom';
type DateRange = { from: string; to: string };
type ProductSales = { id: number; name: string; quantity: number; revenueCents: number };

const PERIODS: { id: PeriodId; label: string }[] = [
  { id: 'today', label: 'Hoje' },
  { id: 'yesterday', label: 'Ontem' },
  { id: 'last7', label: 'Últimos 7 dias' },
  { id: 'last30', label: 'Últimos 30 dias' },
  { id: 'thisMonth', label: 'Este mês' },
  { id: 'lastMonth', label: 'Mês anterior' },
  { id: 'thisYear', label: 'Este ano' },
  { id: 'custom', label: 'Personalizado' },
];

const COLORS = {
  orange: '#E65B2B',
  dark: '#202020',
  muted: '#77716C',
  border: '#EAE6E1',
  blue: '#547DA8',
  green: '#43845B',
  red: '#B94436',
  pale: '#F6F4F1',
};

function localDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function dateFromKey(key: string) {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function addDays(date: Date, amount: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

function daysBetween(from: string, to: string) {
  return Math.round((dateFromKey(to).getTime() - dateFromKey(from).getTime()) / 86400000);
}

function parseDisplayDate(value: string) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim());
  if (!match) return null;
  const [, dayText, monthText, yearText] = match;
  const date = new Date(Number(yearText), Number(monthText) - 1, Number(dayText));
  if (
    date.getFullYear() !== Number(yearText)
    || date.getMonth() !== Number(monthText) - 1
    || date.getDate() !== Number(dayText)
  ) return null;
  return localDateKey(date);
}

function displayDate(key: string) {
  return dateFromKey(key).toLocaleDateString('pt-BR');
}

function resolveRange(period: PeriodId, customFrom: string, customTo: string): DateRange | null {
  const today = new Date();
  const todayKey = localDateKey(today);
  if (period === 'today') return { from: todayKey, to: todayKey };
  if (period === 'yesterday') {
    const yesterday = localDateKey(addDays(today, -1));
    return { from: yesterday, to: yesterday };
  }
  if (period === 'last7') return { from: localDateKey(addDays(today, -6)), to: todayKey };
  if (period === 'last30') return { from: localDateKey(addDays(today, -29)), to: todayKey };
  if (period === 'thisMonth') {
    return { from: localDateKey(new Date(today.getFullYear(), today.getMonth(), 1)), to: todayKey };
  }
  if (period === 'lastMonth') {
    return {
      from: localDateKey(new Date(today.getFullYear(), today.getMonth() - 1, 1)),
      to: localDateKey(new Date(today.getFullYear(), today.getMonth(), 0)),
    };
  }
  if (period === 'thisYear') {
    return { from: localDateKey(new Date(today.getFullYear(), 0, 1)), to: todayKey };
  }
  const from = parseDisplayDate(customFrom);
  const to = parseDisplayDate(customTo);
  return from && to && from <= to ? { from, to } : null;
}

function getPreviousRange(range: DateRange): DateRange {
  const previousTo = addDays(dateFromKey(range.from), -1);
  const previousFrom = addDays(previousTo, -daysBetween(range.from, range.to));
  return { from: localDateKey(previousFrom), to: localDateKey(previousTo) };
}

function isRevenueOrder(order: StaffOrder) {
  return order.status !== 'pending' && order.status !== 'cancelled';
}

function getOrderDateKey(order: StaffOrder) {
  const date = new Date(order.createdAt);
  return Number.isNaN(date.getTime()) ? '' : localDateKey(date);
}

function inRange(order: StaffOrder, range: DateRange) {
  const date = getOrderDateKey(order);
  return date >= range.from && date <= range.to;
}

function getRevenue(orders: StaffOrder[]) {
  return orders.filter(isRevenueOrder).reduce((total, order) => total + order.totalCents, 0);
}

function getPercentChange(current: number, previous: number) {
  if (previous <= 0) return null;
  return ((current - previous) / previous) * 100;
}

function getDailyRevenue(orders: StaffOrder[], range: DateRange) {
  const count = daysBetween(range.from, range.to) + 1;
  const values = Array.from({ length: count }, () => 0);
  for (const order of orders) {
    if (!isRevenueOrder(order)) continue;
    const index = daysBetween(range.from, getOrderDateKey(order));
    if (index >= 0 && index < values.length) values[index] += order.totalCents;
  }
  return values;
}

function summarizeProductSales(orders: StaffOrder[], products: Product[]): ProductSales[] {
  const sales = new Map<number, ProductSales>();
  for (const product of products) {
    sales.set(product.id, { id: product.id, name: product.name, quantity: 0, revenueCents: 0 });
  }
  for (const order of orders) {
    if (!isRevenueOrder(order)) continue;
    for (const item of order.items) {
      const current = sales.get(item.productId) ?? {
        id: item.productId,
        name: item.name,
        quantity: 0,
        revenueCents: 0,
      };
      current.quantity += item.quantity;
      current.revenueCents += item.subtotalCents;
      sales.set(item.productId, current);
    }
  }
  return [...sales.values()];
}

function formatCompactPrice(cents: number) {
  const value = cents / 100;
  if (value >= 100000) return `R$ ${(value / 1000).toFixed(0)} mil`;
  if (value >= 10000) return `R$ ${(value / 1000).toFixed(1)} mil`;
  return formatPrice(cents);
}

function SectionCard({ title, children, subtitle }: { title: string; children: ReactNode; subtitle?: string }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeading}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle ? <Text style={styles.muted}>{subtitle}</Text> : null}
      </View>
      {children}
    </View>
  );
}

function EmptyData({ children }: { children: string }) {
  return (
    <View style={styles.emptyData}>
      <Activity size={19} color={COLORS.muted} />
      <Text style={styles.emptyText}>{children}</Text>
    </View>
  );
}

function MetricCard({
  label,
  value,
  icon,
  comparison,
  unavailable = false,
}: {
  label: string;
  value: string;
  icon: ReactNode;
  comparison?: number | null;
  unavailable?: boolean;
}) {
  return (
    <View style={styles.metricCard}>
      <View style={styles.metricHeading}>
        <View style={styles.metricIcon}>{icon}</View>
        {comparison !== undefined && comparison !== null ? (
          <View style={[styles.comparison, comparison < 0 && styles.comparisonDown]}>
            {comparison < 0
              ? <TrendingDown size={13} color={COLORS.red} />
              : <TrendingUp size={13} color={COLORS.green} />}
            <Text style={[styles.comparisonText, comparison < 0 && styles.comparisonTextDown]}>
              {Math.abs(comparison).toFixed(1)}%
            </Text>
          </View>
        ) : null}
      </View>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
      {unavailable ? <Text style={styles.unavailableCaption}>Dado não coletado</Text> : null}
    </View>
  );
}

function LineChart({
  current,
  previous,
  range,
}: {
  current: number[];
  previous: number[];
  range: DateRange;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const count = Math.max(1, current.length);
  const chartWidth = Math.max(320, count * 30);
  const height = 174;
  const left = 18;
  const right = chartWidth - 16;
  const top = 14;
  const bottom = 136;
  const max = Math.max(1, ...current, ...previous);
  const points = (values: number[]) => values.map((value, index) => ({
    x: count === 1 ? (left + right) / 2 : left + (index * (right - left)) / (count - 1),
    y: bottom - (value / max) * (bottom - top),
  }));
  const currentPoints = points(current);
  const previousPoints = points(previous);
  const pathFor = (values: { x: number; y: number }[]) => values
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');
  const selectedIndex = selected ?? current.length - 1;
  const selectedDate = localDateKey(addDays(dateFromKey(range.from), selectedIndex));

  return (
    <>
      <ScrollView horizontal showsHorizontalScrollIndicator>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Selecionar um dia no gráfico de faturamento"
          onPress={(event) => {
            const position = (event.nativeEvent.locationX - left) / (right - left);
            setSelected(Math.max(0, Math.min(count - 1, Math.round(position * (count - 1)))));
          }}
          style={{ width: chartWidth }}
        >
          <Svg width={chartWidth} height={height}>
            <Path d={`M ${left} ${bottom} L ${right} ${bottom}`} stroke={COLORS.border} strokeWidth={1} />
            <Path d={pathFor(previousPoints)} fill="none" stroke={COLORS.blue} strokeWidth={2} strokeDasharray="5 4" />
            <Path d={pathFor(currentPoints)} fill="none" stroke={COLORS.orange} strokeWidth={2.5} />
            {currentPoints.map((point, index) => (
              <Circle
                key={`current-${index}`}
                cx={point.x}
                cy={point.y}
                r={selectedIndex === index ? 5 : 3}
                fill={COLORS.orange}
              />
            ))}
            {previousPoints.map((point, index) => (
              <Circle
                key={`previous-${index}`}
                cx={point.x}
                cy={point.y}
                r={3}
                fill={COLORS.blue}
              />
            ))}
            {currentPoints.map((point, index) => (
              index % Math.max(1, Math.ceil(count / 7)) === 0 || index === count - 1 ? (
                <SvgText key={`label-${index}`} x={point.x} y={158} fill={COLORS.muted} fontSize={10} textAnchor="middle">
                  {dateFromKey(localDateKey(addDays(dateFromKey(range.from), index))).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                </SvgText>
              ) : null
            ))}
          </Svg>
        </Pressable>
      </ScrollView>
      <View style={styles.chartLegend}>
        <View style={styles.legendItem}><View style={styles.legendOrange} /><Text style={styles.legendText}>Período</Text></View>
        <View style={styles.legendItem}><View style={styles.legendBlue} /><Text style={styles.legendText}>Período anterior</Text></View>
      </View>
      <Text style={styles.chartTooltip}>
        {displayDate(selectedDate)} · Atual {formatPrice(current[selectedIndex] ?? 0)} · Anterior {formatPrice(previous[selectedIndex] ?? 0)}
      </Text>
    </>
  );
}

function BarChart({
  labels,
  values,
  formatValue,
  color = COLORS.orange,
  secondValues,
  secondColor = COLORS.blue,
  secondFormatValue = formatValue,
}: {
  labels: string[];
  values: number[];
  formatValue: (value: number) => string;
  color?: string;
  secondValues?: number[];
  secondColor?: string;
  secondFormatValue?: (value: number) => string;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const chartWidth = Math.max(320, labels.length * 42);
  const height = 166;
  const left = 16;
  const bottom = 128;
  const top = 14;
  const maxFirst = Math.max(1, ...values);
  const maxSecond = Math.max(1, ...(secondValues ?? []));
  const slot = (chartWidth - left * 2) / Math.max(1, labels.length);
  const barWidth = Math.min(20, slot * (secondValues ? 0.28 : 0.52));
  const active = selected ?? 0;

  return (
    <>
      <ScrollView horizontal showsHorizontalScrollIndicator>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Selecionar uma barra no gráfico"
          onPress={(event) => {
            const index = Math.floor((event.nativeEvent.locationX - left) / slot);
            setSelected(Math.max(0, Math.min(labels.length - 1, index)));
          }}
          style={{ width: chartWidth }}
        >
          <Svg width={chartWidth} height={height}>
            <Path d={`M ${left} ${bottom} L ${chartWidth - left} ${bottom}`} stroke={COLORS.border} strokeWidth={1} />
            {labels.map((label, index) => {
              const center = left + slot * (index + 0.5);
              const firstHeight = (values[index] / maxFirst) * (bottom - top);
              const secondHeight = secondValues ? (secondValues[index] / maxSecond) * (bottom - top) : 0;
              return (
                <Fragment key={`${label}-${index}`}>
                  <Rect
                    x={center - (secondValues ? barWidth + 2 : barWidth / 2)}
                    y={bottom - firstHeight}
                    width={barWidth}
                    height={Math.max(values[index] > 0 ? 2 : 0, firstHeight)}
                    rx={4}
                    fill={color}
                  />
                  {secondValues ? (
                    <Rect
                      x={center + 2}
                      y={bottom - secondHeight}
                      width={barWidth}
                      height={Math.max(secondValues[index] > 0 ? 2 : 0, secondHeight)}
                      rx={4}
                      fill={secondColor}
                    />
                  ) : null}
                  <SvgText x={center} y={151} fill={COLORS.muted} fontSize={10} textAnchor="middle">{label}</SvgText>
                </Fragment>
              );
            })}
          </Svg>
        </Pressable>
      </ScrollView>
      {secondValues ? (
        <View style={styles.chartLegend}>
          <View style={styles.legendItem}><View style={[styles.legendOrange, { backgroundColor: color }]} /><Text style={styles.legendText}>Faturamento</Text></View>
          <View style={styles.legendItem}><View style={[styles.legendBlue, { backgroundColor: secondColor }]} /><Text style={styles.legendText}>Pedidos</Text></View>
        </View>
      ) : null}
      <Text style={styles.chartTooltip}>
        {labels[active]} · {formatValue(values[active] ?? 0)}
        {secondValues ? ` · ${secondFormatValue(secondValues[active] ?? 0)}` : ''}
      </Text>
    </>
  );
}

function HorizontalBars({ items }: { items: ProductSales[] }) {
  const [selected, setSelected] = useState<number | null>(null);
  const max = Math.max(1, ...items.map((item) => item.quantity));
  if (items.length === 0) return <EmptyData>Sem produtos vendidos no período selecionado.</EmptyData>;
  return (
    <View style={styles.horizontalBars}>
      {items.map((item, index) => (
        <Pressable
          key={item.id}
          accessibilityRole="button"
          accessibilityLabel={`${item.name}: ${item.quantity} unidades`}
          onPress={() => setSelected(index)}
          style={styles.horizontalBarRow}
        >
          <Text style={styles.horizontalBarLabel} numberOfLines={1}>{item.name}</Text>
          <View style={styles.horizontalTrack}>
            <View style={[styles.horizontalFill, { width: `${(item.quantity / max) * 100}%` }]} />
          </View>
          <Text style={styles.horizontalValue}>{item.quantity}</Text>
        </Pressable>
      ))}
      {selected !== null ? (
        <Text style={styles.chartTooltip}>
          {items[selected].name} · {items[selected].quantity} unidades · {formatPrice(items[selected].revenueCents)}
        </Text>
      ) : null}
    </View>
  );
}

function MissingMetric({ label, icon }: { label: string; icon: ReactNode }) {
  return (
    <View style={styles.missingMetric}>
      <View style={styles.metricIcon}>{icon}</View>
      <View style={styles.missingMetricText}>
        <Text style={styles.missingMetricLabel}>{label}</Text>
        <Text style={styles.missingMetricValue}>Não disponível</Text>
      </View>
    </View>
  );
}

function Insight({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'warning' }) {
  return (
    <View style={[styles.insight, tone === 'warning' && styles.insightWarning]}>
      <Activity size={17} color={tone === 'warning' ? COLORS.red : COLORS.orange} />
      <Text style={styles.insightText}>{children}</Text>
    </View>
  );
}

export default function StaffStatistics({ session, products }: Props) {
  const { width } = useWindowDimensions();
  const [period, setPeriod] = useState<PeriodId>('today');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [rangeOrders, setRangeOrders] = useState<StaffOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [dataReady, setDataReady] = useState(false);
  const requestId = useRef(0);
  const range = useMemo(() => resolveRange(period, customFrom, customTo), [period, customFrom, customTo]);
  const previousRange = useMemo(() => range ? getPreviousRange(range) : null, [range]);

  useEffect(() => {
    if (!range || !previousRange) {
      setLoading(false);
      setDataReady(false);
      setRangeOrders([]);
      setLoadError('');
      return undefined;
    }
    let active = true;
    const currentRequestId = ++requestId.current;
    setLoading(true);
    setDataReady(false);
    setRangeOrders([]);
    setLoadError('');
    getStaffOrdersInRange(session.token, previousRange.from, range.to)
      .then((loadedOrders) => {
        if (active && currentRequestId === requestId.current) {
          setRangeOrders(loadedOrders);
          setDataReady(true);
        }
      })
      .catch((error: unknown) => {
        if (active && currentRequestId === requestId.current) {
          setLoadError(error instanceof Error ? error.message : 'Não foi possível carregar as estatísticas.');
        }
      })
      .finally(() => {
        if (active && currentRequestId === requestId.current) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [session.token, range?.from, range?.to, previousRange?.from]);

  const periodOrders = useMemo(
    () => range ? rangeOrders.filter((order) => inRange(order, range)) : [],
    [rangeOrders, range],
  );
  const previousOrders = useMemo(
    () => previousRange ? rangeOrders.filter((order) => inRange(order, previousRange)) : [],
    [rangeOrders, previousRange],
  );
  const paidOrders = useMemo(() => periodOrders.filter(isRevenueOrder), [periodOrders]);
  const paidPreviousOrders = useMemo(() => previousOrders.filter(isRevenueOrder), [previousOrders]);
  const grossRevenue = getRevenue(periodOrders);
  const previousGrossRevenue = getRevenue(previousOrders);
  const averageTicket = paidOrders.length ? grossRevenue / paidOrders.length : 0;
  const previousAverageTicket = paidPreviousOrders.length
    ? previousGrossRevenue / paidPreviousOrders.length
    : 0;
  const cancelledOrders = periodOrders.filter((order) => order.status === 'cancelled').length;
  const previousCancelledOrders = previousOrders.filter((order) => order.status === 'cancelled').length;
  const cancellationRate = periodOrders.length ? cancelledOrders / periodOrders.length * 100 : 0;
  const previousCancellationRate = previousOrders.length
    ? previousCancelledOrders / previousOrders.length * 100
    : 0;
  const dailyRevenue = range ? getDailyRevenue(periodOrders, range) : [];
  const previousDailyRevenue = previousRange ? getDailyRevenue(previousOrders, previousRange) : [];
  const productSales = useMemo(
    () => summarizeProductSales(periodOrders, products),
    [periodOrders, products],
  );
  const topProducts = [...productSales]
    .filter((product) => product.quantity > 0)
    .sort((left, right) => right.quantity - left.quantity)
    .slice(0, 5);
  const topRevenueProducts = [...productSales]
    .filter((product) => product.revenueCents > 0)
    .sort((left, right) => right.revenueCents - left.revenueCents)
    .slice(0, 5);
  const lowestOutputProducts = [...productSales]
    .sort((left, right) => left.quantity - right.quantity)
    .slice(0, 5);

  const hourlyOrders = Array.from({ length: 24 }, () => 0);
  for (const order of periodOrders) {
    if (order.status === 'cancelled') continue;
    const hour = new Date(order.createdAt).getHours();
    if (Number.isInteger(hour)) hourlyOrders[hour] += 1;
  }
  const weekdayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const weekdayRevenue = Array.from({ length: 7 }, () => 0);
  const weekdayOrders = Array.from({ length: 7 }, () => 0);
  for (const order of periodOrders) {
    if (order.status === 'cancelled') continue;
    const date = new Date(order.createdAt);
    if (Number.isNaN(date.getTime())) continue;
    const weekday = date.getDay();
    weekdayOrders[weekday] += 1;
    if (isRevenueOrder(order)) weekdayRevenue[weekday] += order.totalCents;
  }

  const peakHour = hourlyOrders.indexOf(Math.max(...hourlyOrders));
  const highestRevenueWeekday = weekdayRevenue.indexOf(Math.max(...weekdayRevenue));
  const revenueDropped = previousGrossRevenue > 0 && grossRevenue < previousGrossRevenue;
  const cancellationIncreased = previousOrders.length > 0 && cancellationRate > previousCancellationRate;
  const noOrders = !loading && range !== null && periodOrders.length === 0;
  const cardWidth = width < 600 ? '48%' : width < 900 ? '31.5%' : '23.5%';
  const chartCardWidth = width < 760 ? '100%' : '48.8%';
  const productColumnWidth = width < 760 ? '100%' : '48.5%';
  const missingMetricWidth = width < 600 ? '100%' : '48.5%';
  const customInvalid = period === 'custom' && (
    !parseDisplayDate(customFrom)
    || !parseDisplayDate(customTo)
    || (parseDisplayDate(customFrom) ?? '') > (parseDisplayDate(customTo) ?? '')
  );

  function refresh() {
    if (!range || !previousRange) return;
    const currentRequestId = ++requestId.current;
    setLoading(true);
    setDataReady(false);
    setRangeOrders([]);
    setLoadError('');
    getStaffOrdersInRange(session.token, previousRange.from, range.to)
      .then((loadedOrders) => {
        if (currentRequestId === requestId.current) {
          setRangeOrders(loadedOrders);
          setDataReady(true);
        }
      })
      .catch((error: unknown) => {
        if (currentRequestId === requestId.current) {
          setLoadError(error instanceof Error ? error.message : 'Não foi possível carregar as estatísticas.');
        }
      })
      .finally(() => {
        if (currentRequestId === requestId.current) setLoading(false);
      });
  }

  return (
    <View style={styles.container}>
      <View style={styles.filterCard}>
        <View style={styles.filterHeader}>
          <View style={styles.filterTitleRow}>
            <CalendarDays size={18} color={COLORS.orange} />
            <Text style={styles.filterTitle}>Período</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Atualizar estatísticas"
            disabled={loading || !range}
            onPress={refresh}
            style={styles.refreshButton}
          >
            <RefreshCw size={15} color={COLORS.dark} />
            <Text style={styles.refreshText}>{loading ? 'Carregando...' : 'Atualizar'}</Text>
          </Pressable>
        </View>
        <View style={styles.periodOptions}>
          {PERIODS.map((item) => {
            const selected = period === item.id;
            return (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => {
                  if (item.id === 'custom') {
                    const today = localDateKey(new Date()).split('-').reverse().join('/');
                    setCustomFrom(today);
                    setCustomTo(today);
                  }
                  setPeriod(item.id);
                }}
                style={[styles.periodButton, selected && styles.periodButtonSelected]}
              >
                <Text style={[styles.periodText, selected && styles.periodTextSelected]}>{item.label}</Text>
              </Pressable>
            );
          })}
        </View>
        {period === 'custom' ? (
          <View style={styles.customDates}>
            <TextInput
              accessibilityLabel="Data inicial"
              onChangeText={setCustomFrom}
              placeholder="DD/MM/AAAA"
              keyboardType="numbers-and-punctuation"
              style={[styles.dateInput, customInvalid && styles.dateInputInvalid]}
              value={customFrom}
            />
            <Text style={styles.dateSeparator}>até</Text>
            <TextInput
              accessibilityLabel="Data final"
              onChangeText={setCustomTo}
              placeholder="DD/MM/AAAA"
              keyboardType="numbers-and-punctuation"
              style={[styles.dateInput, customInvalid && styles.dateInputInvalid]}
              value={customTo}
            />
          </View>
        ) : null}
        {customInvalid ? <Text style={styles.validationText}>Informe datas válidas no formato DD/MM/AAAA.</Text> : null}
        {range ? (
          <Text style={styles.rangeCaption}>
            {displayDate(range.from)} – {displayDate(range.to)}
            {previousRange ? ` · comparação: ${displayDate(previousRange.from)} – ${displayDate(previousRange.to)}` : ''}
          </Text>
        ) : null}
      </View>

      {!dataReady ? (
        loadError ? (
          <View style={styles.loadState}>
            <Text accessibilityRole="alert" style={styles.error}>{loadError}</Text>
            <Text style={styles.emptyText}>Os indicadores não foram atualizados. Tente novamente.</Text>
          </View>
        ) : (
          <View style={styles.loadState}>
            <ActivityIndicator color={COLORS.orange} />
            <Text style={styles.emptyText}>{range ? 'Carregando dados do período...' : 'Informe um intervalo válido para ver os indicadores.'}</Text>
          </View>
        )
      ) : (
        <>

      <SectionCard title="Indicadores financeiros" subtitle="Receita calculada a partir de pedidos confirmados ou concluídos.">
        <View style={styles.metricGrid}>
          <View style={[styles.metricSlot, { width: cardWidth }]}>
            <MetricCard label="Faturamento bruto" value={formatPrice(grossRevenue)} icon={<Banknote size={18} color={COLORS.orange} />} comparison={getPercentChange(grossRevenue, previousGrossRevenue)} />
          </View>
          <View style={[styles.metricSlot, { width: cardWidth }]}>
            <MetricCard label="Faturamento líquido" value="Não disponível" icon={<Wallet size={18} color={COLORS.orange} />} unavailable />
          </View>
          <View style={[styles.metricSlot, { width: cardWidth }]}>
            <MetricCard label="Despesas totais" value="Não disponível" icon={<CreditCard size={18} color={COLORS.orange} />} unavailable />
          </View>
          <View style={[styles.metricSlot, { width: cardWidth }]}>
            <MetricCard label="Lucro líquido" value="Não disponível" icon={<CircleDollarSign size={18} color={COLORS.orange} />} unavailable />
          </View>
          <View style={[styles.metricSlot, { width: cardWidth }]}>
            <MetricCard label="Margem de lucro" value="Não disponível" icon={<TrendingUp size={18} color={COLORS.orange} />} unavailable />
          </View>
          <View style={[styles.metricSlot, { width: cardWidth }]}>
            <MetricCard
              label="Ticket médio"
              value={paidOrders.length ? formatPrice(averageTicket) : 'Não disponível'}
              icon={<ShoppingBag size={18} color={COLORS.orange} />}
              comparison={paidOrders.length && paidPreviousOrders.length ? getPercentChange(averageTicket, previousAverageTicket) : null}
              unavailable={!paidOrders.length}
            />
          </View>
          <View style={[styles.metricSlot, { width: cardWidth }]}>
            <MetricCard label="Total de pedidos" value={String(periodOrders.length)} icon={<BarChart3 size={18} color={COLORS.orange} />} comparison={getPercentChange(periodOrders.length, previousOrders.length)} />
          </View>
          <View style={[styles.metricSlot, { width: cardWidth }]}>
            <MetricCard label="Clientes atendidos" value="Não disponível" icon={<UsersRound size={18} color={COLORS.orange} />} unavailable />
          </View>
          <View style={[styles.metricSlot, { width: cardWidth }]}>
            <MetricCard
              label="Taxa de cancelamento"
              value={periodOrders.length ? `${cancellationRate.toFixed(1)}%` : 'Não disponível'}
              icon={<XCircle size={18} color={COLORS.orange} />}
              comparison={periodOrders.length && previousOrders.length ? getPercentChange(cancellationRate, previousCancellationRate) : null}
              unavailable={!periodOrders.length}
            />
          </View>
        </View>
        <Text style={styles.footnote}>Comparações são exibidas quando o período anterior tem dados suficientes. Pedidos pendentes e cancelados não entram no faturamento.</Text>
      </SectionCard>

      {noOrders ? (
        <View style={styles.emptyPanel}>
          <ShoppingBag size={22} color={COLORS.muted} />
          <Text style={styles.emptyTitle}>Nenhum pedido no período</Text>
          <Text style={styles.emptyText}>Os indicadores e gráficos serão preenchidos quando houver pedidos registrados nesse intervalo.</Text>
        </View>
      ) : null}

      <View style={styles.chartGrid}>
        <View style={[styles.chartCard, { width: chartCardWidth }]}>
          <Text style={styles.chartTitle}>Evolução do faturamento</Text>
          <Text style={styles.chartSubtitle}>Comparação diária com o período anterior</Text>
          {range ? <LineChart current={dailyRevenue} previous={previousDailyRevenue} range={range} /> : <EmptyData>Selecione um intervalo válido.</EmptyData>}
        </View>
        <View style={[styles.chartCard, { width: chartCardWidth }]}>
          <Text style={styles.chartTitle}>Vendas por horário</Text>
          <Text style={styles.chartSubtitle}>Pedidos não cancelados por hora de criação</Text>
          <BarChart labels={hourlyOrders.map((_, hour) => `${String(hour).padStart(2, '0')}h`)} values={hourlyOrders} formatValue={(value) => `${value} pedidos`} />
          {Math.max(...hourlyOrders) > 0 ? <Text style={styles.footnote}>Horário de pico no intervalo: {String(peakHour).padStart(2, '0')}h ({hourlyOrders[peakHour]} pedidos).</Text> : null}
        </View>
        <View style={[styles.chartCard, { width: chartCardWidth }]}>
          <Text style={styles.chartTitle}>Formas de pagamento</Text>
          <Text style={styles.chartSubtitle}>Distribuição por método</Text>
          <EmptyData>O sistema ainda não registra a forma de pagamento dos pedidos.</EmptyData>
        </View>
        <View style={[styles.chartCard, { width: chartCardWidth }]}>
          <Text style={styles.chartTitle}>Vendas por dia da semana</Text>
          <Text style={styles.chartSubtitle}>Barras normalizadas por série; valores exatos no toque</Text>
          <BarChart
            labels={weekdayLabels}
            values={weekdayRevenue}
            formatValue={formatCompactPrice}
            secondValues={weekdayOrders}
            secondFormatValue={(value) => `${value} pedidos`}
          />
          {Math.max(...weekdayRevenue) > 0 ? (
            <Text style={styles.footnote}>
              Maior faturamento observado: {weekdayLabels[highestRevenueWeekday]} ({formatPrice(weekdayRevenue[highestRevenueWeekday])}).
            </Text>
          ) : null}
        </View>
        <View style={[styles.chartCard, { width: chartCardWidth }]}>
          <Text style={styles.chartTitle}>Receitas e despesas</Text>
          <Text style={styles.chartSubtitle}>Valores confirmados no período</Text>
          {paidOrders.length ? (
            <>
              <BarChart
                labels={weekdayLabels}
                values={weekdayRevenue}
                formatValue={formatCompactPrice}
              />
              <Text style={styles.footnote}>Receita bruta exibida. Custos e despesas não são registrados pelo sistema.</Text>
            </>
          ) : <EmptyData>Não há receita confirmada neste período.</EmptyData>}
        </View>
      </View>

      <SectionCard title="Desempenho dos produtos" subtitle="Vendas confirmadas no período; margens não disponíveis sem custo por produto.">
        <View style={styles.productColumns}>
          <View style={[styles.productColumn, { width: productColumnWidth }]}>
            <Text style={styles.subsectionTitle}>Top 5 mais vendidos</Text>
            <HorizontalBars items={topProducts} />
          </View>
          <View style={[styles.productColumn, { width: productColumnWidth }]}>
            <Text style={styles.subsectionTitle}>Top 5 por faturamento</Text>
            {topRevenueProducts.length ? topRevenueProducts.map((item) => (
              <View key={item.id} style={styles.productListRow}>
                <View style={styles.productRowText}>
                  <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.muted}>{item.quantity} unidades</Text>
                </View>
                <Text style={styles.productRevenue}>{formatPrice(item.revenueCents)}</Text>
              </View>
            )) : <EmptyData>Sem vendas de produtos no período.</EmptyData>}
          </View>
        </View>
        <Text style={styles.subsectionTitle}>Produtos com menor saída no período</Text>
        {lowestOutputProducts.length ? lowestOutputProducts.map((item) => (
          <View key={`low-${item.id}`} style={styles.productListRow}>
            <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.productRevenue}>{item.quantity} unidades</Text>
          </View>
        )) : <EmptyData>Não há produtos cadastrados para comparar.</EmptyData>}
        {productSales.length ? (
          <>
            <Text style={styles.subsectionTitle}>Resumo por produto</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator>
              <View>
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableCell, styles.tableProduct]}>Produto</Text>
                  <Text style={styles.tableCell}>Quantidade</Text>
                  <Text style={styles.tableCell}>Faturamento</Text>
                  <Text style={styles.tableCell}>Margem</Text>
                </View>
                {productSales.map((item) => (
                  <View key={`table-${item.id}`} style={styles.tableRow}>
                    <Text style={[styles.tableCell, styles.tableProduct]} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.tableCell}>{item.quantity}</Text>
                    <Text style={styles.tableCell}>{formatPrice(item.revenueCents)}</Text>
                    <Text style={styles.tableCell}>N/D</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </>
        ) : null}
      </SectionCard>

      <SectionCard title="Indicadores operacionais">
        <View style={styles.metricGrid}>
          <View style={[styles.metricSlot, { width: cardWidth }]}><MetricCard label="Pedidos concluídos" value={String(periodOrders.filter((order) => order.status === 'delivered').length)} icon={<CheckCircle2 size={18} color={COLORS.green} />} /></View>
          <View style={[styles.metricSlot, { width: cardWidth }]}><MetricCard label="Pedidos cancelados" value={String(cancelledOrders)} icon={<XCircle size={18} color={COLORS.red} />} /></View>
          <View style={[styles.metricSlot, { width: cardWidth }]}><MetricCard label="Pedidos em andamento" value={String(periodOrders.filter((order) => ['confirmed', 'preparing', 'out_for_delivery'].includes(order.status)).length)} icon={<Activity size={18} color={COLORS.orange} />} /></View>
          <View style={[styles.metricSlot, { width: cardWidth }]}><MetricCard label="Tempo médio de preparo" value="Não disponível" icon={<Clock3 size={18} color={COLORS.orange} />} unavailable /></View>
          <View style={[styles.metricSlot, { width: cardWidth }]}><MetricCard label="Tempo médio de atendimento" value="Não disponível" icon={<Clock3 size={18} color={COLORS.orange} />} unavailable /></View>
          <View style={[styles.metricSlot, { width: cardWidth }]}><MetricCard label="Pedidos atrasados" value="Não disponível" icon={<Clock3 size={18} color={COLORS.orange} />} unavailable /></View>
        </View>
        <View style={styles.missingGrid}>
          <View style={{ width: missingMetricWidth }}><MissingMetric label="Modalidade (salão, retirada e delivery)" icon={<ShoppingBag size={17} color={COLORS.orange} />} /></View>
          <View style={{ width: missingMetricWidth }}><MissingMetric label="Desempenho por turno" icon={<Clock3 size={17} color={COLORS.orange} />} /></View>
        </View>
      </SectionCard>

      <SectionCard title="Estoque e perdas">
        <View style={styles.missingGrid}>
          <View style={{ width: missingMetricWidth }}><MissingMetric label="Produtos com estoque baixo" icon={<Package size={17} color={COLORS.orange} />} /></View>
          <View style={{ width: missingMetricWidth }}><MissingMetric label="Produtos sem estoque" icon={<Package size={17} color={COLORS.orange} />} /></View>
          <View style={{ width: missingMetricWidth }}><MissingMetric label="Próximos do vencimento" icon={<CalendarDays size={17} color={COLORS.orange} />} /></View>
          <View style={{ width: missingMetricWidth }}><MissingMetric label="Valor estimado do estoque" icon={<Wallet size={17} color={COLORS.orange} />} /></View>
          <View style={{ width: missingMetricWidth }}><MissingMetric label="Perdas e desperdícios" icon={<TrendingDown size={17} color={COLORS.orange} />} /></View>
        </View>
        <Text style={styles.footnote}>O cadastro atual não contém quantidades de estoque, validade ou registro de perdas.</Text>
      </SectionCard>

      <SectionCard title="Clientes e avaliações">
        <View style={styles.missingGrid}>
          <View style={{ width: missingMetricWidth }}><MissingMetric label="Clientes novos e recorrentes" icon={<UsersRound size={17} color={COLORS.orange} />} /></View>
          <View style={{ width: missingMetricWidth }}><MissingMetric label="Taxa de retorno" icon={<TrendingUp size={17} color={COLORS.orange} />} /></View>
          <View style={{ width: missingMetricWidth }}><MissingMetric label="Ticket médio por cliente" icon={<CircleDollarSign size={17} color={COLORS.orange} />} /></View>
          <View style={{ width: missingMetricWidth }}><MissingMetric label="Avaliações recebidas" icon={<Star size={17} color={COLORS.orange} />} /></View>
          <View style={{ width: missingMetricWidth }}><MissingMetric label="Reclamações registradas" icon={<Activity size={17} color={COLORS.orange} />} /></View>
        </View>
        <Text style={styles.footnote}>Pedidos não possuem identificação de cliente nem registros de avaliações ou reclamações.</Text>
      </SectionCard>

      <SectionCard title="Insights e alertas">
        {revenueDropped ? (
          <Insight tone="warning">
            O faturamento confirmado caiu {Math.abs(getPercentChange(grossRevenue, previousGrossRevenue) ?? 0).toFixed(1)}% em relação ao período anterior.
          </Insight>
        ) : null}
        {cancellationIncreased ? (
          <Insight tone="warning">
            A taxa de cancelamento aumentou de {previousCancellationRate.toFixed(1)}% para {cancellationRate.toFixed(1)}%.
          </Insight>
        ) : null}
        {Math.max(...hourlyOrders) > 0 ? (
          <Insight>Maior movimento registrado às {String(peakHour).padStart(2, '0')}h ({hourlyOrders[peakHour]} pedidos não cancelados).</Insight>
        ) : null}
        {Math.max(...weekdayRevenue) > 0 ? (
          <Insight>Dia com maior faturamento observado: {weekdayLabels[highestRevenueWeekday]} ({formatPrice(weekdayRevenue[highestRevenueWeekday])}).</Insight>
        ) : null}
        {lowestOutputProducts.some((product) => product.quantity === 0) ? (
          <Insight>Há produtos cadastrados sem vendas confirmadas neste período; confira a lista de menor saída.</Insight>
        ) : null}
        {!revenueDropped && !cancellationIncreased && Math.max(...hourlyOrders) === 0 && Math.max(...weekdayRevenue) === 0 && !lowestOutputProducts.some((product) => product.quantity === 0) ? (
          <EmptyData>Não há dados suficientes para gerar alertas neste período.</EmptyData>
        ) : null}
        <Insight>Alertas de estoque crítico não podem ser calculados porque o sistema não registra quantidades de estoque.</Insight>
      </SectionCard>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16 },
  filterCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 18, gap: 12, borderWidth: 1, borderColor: COLORS.border },
  filterHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  filterTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  filterTitle: { color: COLORS.dark, fontSize: 17, fontWeight: '800' },
  refreshButton: { backgroundColor: '#F1EEEA', borderRadius: 16, paddingHorizontal: 13, paddingVertical: 9, flexDirection: 'row', alignItems: 'center', gap: 7 },
  refreshText: { color: COLORS.dark, fontWeight: '700', fontSize: 13 },
  periodOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  periodButton: { borderWidth: 1, borderColor: '#DDD7D1', borderRadius: 18, paddingHorizontal: 13, paddingVertical: 9 },
  periodButtonSelected: { backgroundColor: COLORS.orange, borderColor: COLORS.orange },
  periodText: { color: '#5E5853', fontSize: 13, fontWeight: '600' },
  periodTextSelected: { color: '#FFFFFF', fontWeight: '800' },
  customDates: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  dateInput: { minWidth: 130, minHeight: 42, borderWidth: 1, borderColor: '#DDD7D1', borderRadius: 10, paddingHorizontal: 12, backgroundColor: '#FFFFFF', color: COLORS.dark },
  dateInputInvalid: { borderColor: COLORS.red },
  dateSeparator: { color: COLORS.muted, fontSize: 13 },
  validationText: { color: COLORS.red, fontSize: 13 },
  rangeCaption: { color: COLORS.muted, fontSize: 12 },
  loadState: { minHeight: 110, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 18, alignItems: 'center', justifyContent: 'center', gap: 10, borderWidth: 1, borderColor: COLORS.border },
  error: { width: '100%', color: '#9B1C1C', backgroundColor: '#FCE8E6', borderRadius: 12, padding: 12 },
  section: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 18, gap: 14, borderWidth: 1, borderColor: COLORS.border },
  sectionHeading: { gap: 4 },
  sectionTitle: { color: COLORS.dark, fontSize: 20, fontWeight: '800' },
  muted: { color: COLORS.muted, fontSize: 12 },
  metricGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 10 },
  metricSlot: { minWidth: 145 },
  metricCard: { minHeight: 128, borderWidth: 1, borderColor: COLORS.border, borderRadius: 14, padding: 13, justifyContent: 'space-between', gap: 7 },
  metricHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  metricIcon: { width: 34, height: 34, borderRadius: 11, backgroundColor: '#FFF0E8', alignItems: 'center', justifyContent: 'center' },
  metricValue: { color: COLORS.dark, fontSize: 19, fontWeight: '800' },
  metricLabel: { color: '#68625D', fontSize: 12, fontWeight: '600' },
  unavailableCaption: { color: COLORS.muted, fontSize: 10 },
  comparison: { borderRadius: 12, backgroundColor: '#EAF4EC', paddingHorizontal: 7, paddingVertical: 4, flexDirection: 'row', alignItems: 'center', gap: 3 },
  comparisonDown: { backgroundColor: '#FCEBE8' },
  comparisonText: { color: COLORS.green, fontSize: 11, fontWeight: '800' },
  comparisonTextDown: { color: COLORS.red },
  footnote: { color: COLORS.muted, fontSize: 12, lineHeight: 18 },
  emptyData: { minHeight: 72, borderRadius: 12, backgroundColor: '#F8F7F5', padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  emptyText: { flex: 1, color: COLORS.muted, fontSize: 13, lineHeight: 19 },
  emptyPanel: { alignItems: 'center', backgroundColor: '#FFFFFF', borderColor: COLORS.border, borderWidth: 1, borderRadius: 16, padding: 22, gap: 7 },
  emptyTitle: { color: COLORS.dark, fontSize: 16, fontWeight: '800' },
  chartGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12 },
  chartCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, gap: 10, borderWidth: 1, borderColor: COLORS.border },
  chartTitle: { color: COLORS.dark, fontSize: 16, fontWeight: '800' },
  chartSubtitle: { color: COLORS.muted, fontSize: 12, marginTop: -6 },
  chartLegend: { flexDirection: 'row', gap: 16, flexWrap: 'wrap' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendOrange: { width: 9, height: 9, borderRadius: 5, backgroundColor: COLORS.orange },
  legendBlue: { width: 9, height: 9, borderRadius: 5, backgroundColor: COLORS.blue },
  legendText: { color: COLORS.muted, fontSize: 11 },
  chartTooltip: { color: '#5E5853', backgroundColor: '#F8F7F5', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7, fontSize: 11 },
  productColumns: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 18 },
  productColumn: { gap: 10 },
  subsectionTitle: { color: COLORS.dark, fontSize: 14, fontWeight: '800', marginTop: 4 },
  horizontalBars: { gap: 10 },
  horizontalBarRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  horizontalBarLabel: { width: 100, color: '#5E5853', fontSize: 12 },
  horizontalTrack: { flex: 1, height: 11, borderRadius: 6, backgroundColor: '#F1EEEA', overflow: 'hidden' },
  horizontalFill: { height: '100%', borderRadius: 6, backgroundColor: COLORS.orange },
  horizontalValue: { width: 26, color: COLORS.dark, textAlign: 'right', fontWeight: '800', fontSize: 12 },
  productListRow: { minHeight: 42, borderTopWidth: 1, borderTopColor: COLORS.border, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  productRowText: { flex: 1, gap: 3 },
  productName: { flex: 1, color: '#292929', fontSize: 13, fontWeight: '600' },
  productRevenue: { color: COLORS.dark, fontSize: 12, fontWeight: '700' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#F8F7F5', borderRadius: 8 },
  tableRow: { minHeight: 38, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tableCell: { width: 105, color: '#5E5853', fontSize: 12, paddingHorizontal: 9, paddingVertical: 8 },
  tableProduct: { width: 190, fontWeight: '700' },
  missingGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  missingMetric: { minHeight: 62, padding: 10, borderRadius: 11, borderWidth: 1, borderColor: COLORS.border, flexDirection: 'row', alignItems: 'center', gap: 9 },
  missingMetricText: { flex: 1, gap: 3 },
  missingMetricLabel: { color: '#5E5853', fontSize: 12, fontWeight: '600' },
  missingMetricValue: { color: COLORS.muted, fontSize: 11 },
  insight: { flexDirection: 'row', alignItems: 'flex-start', gap: 9, backgroundColor: '#F8F7F5', borderRadius: 11, padding: 12 },
  insightWarning: { backgroundColor: '#FFF0ED' },
  insightText: { flex: 1, color: '#4F4944', fontSize: 13, lineHeight: 19 },
});
