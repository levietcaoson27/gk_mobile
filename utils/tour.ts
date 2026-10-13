export interface Tour {
  id: string;
  name: string;
  city: string;
  days: number;
  price: number;
  seats: number;
  departure: string; // "YYYY-MM-DD"
  image: string;
  isFavorite: boolean;
}

export interface CitySection {
  title: string; // Định dạng "Thành phố · n tour"
  cityName: string; // Tên thành phố gốc để so sánh
  data: Tour[];
}

// Định dạng ngày "2026-11-05" -> "05/11/2026"
export function formatDate(dateString: string): string {
  if (!dateString) return "";
  const parts = dateString.split("-");
  if (parts.length !== 3) return dateString;
  const [year, month, day] = parts;
  return `${day}/${month}/${year}`;
}

// Nhãn số chỗ
export function getSeatLabel(seats: number): string {
  if (seats === 0) {
    return "Hết chỗ";
  } else if (seats >= 1 && seats <= 3) {
    return `Chỉ còn ${seats} chỗ`;
  } else {
    return `Còn ${seats} chỗ`;
  }
}

// Gom nhóm theo thành phố (A -> Z), tour trong nhóm sắp xếp theo departure tăng dần
export function groupByCity(tours: Tour[]): CitySection[] {
  const groups: { [key: string]: Tour[] } = {};

  tours.forEach((tour) => {
    const city = tour.city || "Khác";
    if (!groups[city]) {
      groups[city] = [];
    }
    groups[city].push(tour);
  });

  // Sắp xếp tour trong từng nhóm theo departure tăng dần
  Object.keys(groups).forEach((city) => {
    groups[city].sort((a, b) => a.departure.localeCompare(b.departure));
  });

  // Lấy danh sách thành phố sắp xếp theo A -> Z
  const sortedCities = Object.keys(groups).sort((a, b) => a.localeCompare(b));

  return sortedCities.map((city) => ({
    title: `${city} · ${groups[city].length} tour`,
    cityName: city,
    data: groups[city],
  }));
}