import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  StyleSheet, View, Text, Image, TouchableOpacity,
  ScrollView, TextInput, Animated
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MenuContext } from './MenuContext';
import DropDownPicker from 'react-native-dropdown-picker';

type RootStackParamList = {
  Home: { newMenuItem?: MenuItem };
  FilterMenu: undefined;
  AboutUs: undefined;
};

type HomePageNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

interface HomePageProps { navigation: HomePageNavigationProp; }

interface MenuItem {
  id: string; name: string; description: string; course: string; price: number;
}

interface Totals { totalItems: number; averagePrices: { [course: string]: string }; }

interface Errors { name?: string; description?: string; price?: string; course?: string; }

const HomePage: React.FC<HomePageProps> = ({ navigation }) => {
  const menuContext = useContext(MenuContext)!;
  const { menuItems, addMenuItem } = menuContext;

  const [totals, setTotals] = useState<Totals>({ totalItems: 0, averagePrices: {} });
  useEffect(() => {
    const totalItems = menuItems.length;
    const sums = menuItems.reduce((acc, item) => {
      if (!acc[item.course]) acc[item.course] = { total: 0, count: 0 };
      acc[item.course].total += item.price;
      acc[item.course].count++;
      return acc;
    }, {} as { [k: string]: { total: number; count: number } });
    const averagePrices: { [course: string]: string } = {};
    Object.keys(sums).forEach(c => { averagePrices[c] = (sums[c].total / sums[c].count).toFixed(2); });
    setTotals({ totalItems, averagePrices });
  }, [menuItems]);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [course, setCourse] = useState<string | null>(null);
  const [errors, setErrors] = useState<Errors>({});

  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([
    { label: 'Starters', value: 'Starters' },
    { label: 'Mains', value: 'Mains' },
    { label: 'Dessert', value: 'Dessert' },
  ]);

  const pulse = useRef(new Animated.Value(1)).current;
  const runPulse = () => {
    Animated.sequence([
      Animated.timing(pulse, { toValue: 1.15, duration: 120, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
  };

  const validateAndAdd = () => {
    const e: Errors = {};
    let ok = true;
    if (!name) { e.name = 'Dish name is required.'; ok = false; }
    if (!description) { e.description = 'Description is required.'; ok = false; }
    if (!price) { e.price = 'Price is required.'; ok = false; }
    else if (!/^R?\d+$/.test(price)) { e.price = 'Enter an integer (e.g., 100 or R100).'; ok = false; }
    if (!course) { e.course = 'Please select a course.'; ok = false; }
    setErrors(e);
    if (!ok || !course) return;

    const numeric = parseInt(price.replace('R', ''), 10);
    const newItem: MenuItem = { id: Date.now().toString(), name, description, course, price: numeric };
    addMenuItem(newItem);
    setName('');
    setDescription('');
    setCourse(null);
    setPrice('');
    setErrors({});
    runPulse();
  };

  const scrollRef = useRef<ScrollView>(null);
  const addFormY = useRef(0);
  const scrollToAddForm = () => scrollRef.current?.scrollTo({ y: addFormY.current - 16, animated: true });

  return (
    <ScrollView ref={scrollRef} style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Image source={require('../assets/Logo.png')} style={styles.logo} />
      <Text style={styles.title}>The Chef's Menu</Text>
      <Text style={styles.welcomeText}>
        Welcome to FlavorScape – your partner for effortless menu creation and management.
      </Text>

      <Animated.Text style={[styles.stats, { transform: [{ scale: pulse }] }]}>
        Total Menu Items: {totals.totalItems}
      </Animated.Text>
      <Text style={styles.stats}>Starters Avg Price: R{totals.averagePrices['Starters'] || 'N/A'}</Text>
      <Text style={styles.stats}>Mains Avg Price: R{totals.averagePrices['Mains'] || 'N/A'}</Text>
      <Text style={styles.stats}>Dessert Avg Price: R{totals.averagePrices['Dessert'] || 'N/A'}</Text>

      {/* Add form */}
      <View onLayout={e => { addFormY.current = e.nativeEvent.layout.y; }} style={{ width: '100%', marginTop: 20 }}>
        <Text style={[styles.title, { fontSize: 22, marginBottom: 10 }]}>Add a NEW Menu Item</Text>

        <TextInput style={styles.input} placeholder="Dish Name" placeholderTextColor="#AAAAAA" value={name} onChangeText={setName} />
        {errors.name && <Text style={{ color: 'red' }}>{errors.name}</Text>}

        <TextInput style={styles.input} placeholder="Description" placeholderTextColor="#AAAAAA" value={description} onChangeText={setDescription} />
        {errors.description && <Text style={{ color: 'red' }}>{errors.description}</Text>}

        <DropDownPicker
          open={open}
          value={course}
          items={items}
          setOpen={setOpen}
          setValue={setCourse}
          setItems={setItems}
          placeholder="Select Course"
          style={styles.picker}
          dropDownContainerStyle={styles.dropDownPicker}
          listMode="SCROLLVIEW"
          dropDownDirection="BOTTOM"
          placeholderStyle={{ color: '#AAAAAA' }}
        />
        {errors.course && <Text style={{ color: 'red' }}>{errors.course}</Text>}

        <TextInput
          style={styles.input}
          placeholder="Price (e.g., 100 or R100)"
          placeholderTextColor="#AAAAAA"
          keyboardType="numeric"
          value={price}
          onChangeText={setPrice}
        />
        {errors.price && <Text style={{ color: 'red' }}>{errors.price}</Text>}

        <TouchableOpacity style={styles.navigationButton} onPress={validateAndAdd}>
  <Text style={styles.buttonText}>ADD MENU ITEM</Text>
</TouchableOpacity>

      </View>

      {/* Render menu cards */}
      <View style={styles.coursesContainer}>
        {menuItems.map(item => (
          <View key={item.id} style={styles.courseCard}>
            <Text style={styles.courseTitle}>{item.course}</Text>
            <Text style={styles.coursePrice}>{item.name} - R{item.price}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>
        ))}
      </View>

{/* Navigation buttons */}
<View style={styles.buttonRow}>
  <TouchableOpacity
    style={styles.bottomNavButton}
    onPress={() => navigation.navigate('FilterMenu')}
  >
    <Text style={styles.buttonText}>FILTER MENU</Text>
  </TouchableOpacity>

  <TouchableOpacity
    style={styles.bottomNavButton}
    onPress={() => navigation.navigate('AboutUs')}
  >
    <Text style={styles.buttonText}>ABOUT US</Text>
  </TouchableOpacity>
</View>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#333333' },
  contentContainer: { alignItems: 'center', padding: 20 },
  logo: { width: 200, height: 100, marginBottom: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#FF6E6E', marginBottom: 5, textAlign: 'center' },
  welcomeText: { fontSize: 18, color: '#FFFFFF', marginBottom: 20, textAlign: 'center' },
  stats: { fontSize: 16, color: '#FFFFFF', textAlign: 'center', marginBottom: 5 },

  input: {
    height: 50,
    backgroundColor: '#424242',
    color: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    width: '100%',
  },

  picker: { backgroundColor: '#424242', borderRadius: 10, borderWidth: 0, marginBottom: 15 },
  dropDownPicker: { backgroundColor: '#424242' },

  coursesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'flex-start',
    width: '100%',
    marginTop: 20,
  },

  courseCard: {
    minWidth: '30%',
    maxWidth: '45%',
    backgroundColor: '#424242',
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 200,
    marginBottom: 20,
  },

  courseTitle: { fontSize: 16, fontWeight: 'bold', color: '#FF6E6E', marginBottom: 5 },
  coursePrice: { fontSize: 14, color: '#FFFFFF', marginBottom: 5 },
  description: { fontSize: 12, color: '#FFFFFF', textAlign: 'center' },

  buttonText: { color: '#FFFFFF', fontWeight: 'bold', textAlign: 'center' },

  /* ✅ Bottom row: two wide, even buttons */
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 24,
    paddingHorizontal: 16,
  },
  bottomNavButton: {
    backgroundColor: '#FF6E6E',
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
    width: '48%',       // two equal wide buttons
  },

  /* ✅ Top add button: full width and centered */
  navigationButton: {
    backgroundColor: '#FF6E6E',
    paddingVertical: 12,
    borderRadius: 5,
    width: '100%',      // full width under the inputs
    alignSelf: 'center',
    marginTop: 8,
  },
});


export default HomePage;


