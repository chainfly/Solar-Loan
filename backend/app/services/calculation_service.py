"""
Calculation Service
"""
import json
import csv
from pathlib import Path
from decimal import Decimal
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)


class CalculationService:
    """Financial calculation service"""
    
    def __init__(self):
        self.data_dir = Path(settings.DATA_DIR)
        self._irradiation_data = None
        self._subsidy_data = None
    
    def _load_irradiation_data(self):
        """Load irradiation data from CSV"""
        if self._irradiation_data is None:
            csv_path = self.data_dir / "irradiation.csv"
            if csv_path.exists():
                with open(csv_path, 'r') as f:
                    reader = csv.DictReader(f)
                    self._irradiation_data = {row['state']: float(row['irradiation']) for row in reader}
            else:
                # Default values
                self._irradiation_data = {
                    "Maharashtra": 5.5,
                    "Gujarat": 5.8,
                    "Rajasthan": 6.0,
                    "Karnataka": 5.2,
                    "Tamil Nadu": 5.0,
                }
        return self._irradiation_data
    
    def _load_subsidy_data(self):
        """Load subsidy data from JSON"""
        if self._subsidy_data is None:
            json_path = self.data_dir / "subsidy.json"
            if json_path.exists():
                with open(json_path, 'r') as f:
                    self._subsidy_data = json.load(f)
            else:
                # Default subsidy structure
                self._subsidy_data = {
                    "central": {
                        "residential": {
                            "upto_3kw": {"percentage": 40, "max_amount": 30000},
                            "above_3kw": {"percentage": 40, "max_amount": 40000},
                        },
                        "commercial": {
                            "percentage": 0,
                        },
                    },
                    "state": {
                        "Maharashtra": {"percentage": 20, "max_amount": 20000},
                        "Gujarat": {"percentage": 25, "max_amount": 25000},
                        "Rajasthan": {"percentage": 15, "max_amount": 15000},
                    },
                }
        return self._subsidy_data
    
    @staticmethod
    async def calculate_emi(
        principal: Decimal,
        interest_rate: Decimal,
        tenure_years: int,
    ) -> dict:
        """Calculate EMI using formula: EMI = P × r × (1 + r)^n / ((1 + r)^n - 1)"""
        # Convert annual rate to monthly
        monthly_rate = float(interest_rate) / 100 / 12
        tenure_months = tenure_years * 12
        
        if monthly_rate == 0:
            emi = float(principal) / tenure_months
        else:
            emi = float(principal) * monthly_rate * ((1 + monthly_rate) ** tenure_months) / (
                ((1 + monthly_rate) ** tenure_months) - 1
            )
        
        total_amount = emi * tenure_months
        total_interest = total_amount - float(principal)
        
        return {
            "emi_amount": Decimal(str(round(emi, 2))),
            "total_amount": Decimal(str(round(total_amount, 2))),
            "total_interest": Decimal(str(round(total_interest, 2))),
            "principal": principal,
            "interest_rate": interest_rate,
            "tenure_years": tenure_years,
            "tenure_months": tenure_months,
        }
    
    async def calculate_subsidy(
        self,
        system_capacity_kw: Decimal,
        state: str,
        system_type: str = "residential",
    ) -> dict:
        """Calculate subsidy amount"""
        subsidy_data = self._load_subsidy_data()
        
        # Central subsidy
        central_subsidy = Decimal("0")
        if system_type == "residential":
            if system_capacity_kw <= 3:
                central_info = subsidy_data["central"]["residential"]["upto_3kw"]
                central_subsidy = min(
                    system_capacity_kw * 1000 * Decimal(str(central_info["percentage"])) / 100,
                    Decimal(str(central_info["max_amount"])),
                )
            else:
                central_info = subsidy_data["central"]["residential"]["above_3kw"]
                central_subsidy = min(
                    system_capacity_kw * 1000 * Decimal(str(central_info["percentage"])) / 100,
                    Decimal(str(central_info["max_amount"])),
                )
        
        # State subsidy
        state_subsidy = Decimal("0")
        if state in subsidy_data.get("state", {}):
            state_info = subsidy_data["state"][state]
            state_subsidy = min(
                system_capacity_kw * 1000 * Decimal(str(state_info["percentage"])) / 100,
                Decimal(str(state_info["max_amount"])),
            )
        
        total_subsidy = central_subsidy + state_subsidy
        
        return {
            "subsidy_amount": total_subsidy,
            "central_subsidy": central_subsidy,
            "state_subsidy": state_subsidy,
            "system_capacity_kw": system_capacity_kw,
            "state": state,
            "system_type": system_type,
        }
    
    async def calculate_roi(
        self,
        system_capacity_kw: Decimal,
        location: str,
        installation_cost: Decimal,
        electricity_rate: Decimal = Decimal("8.0"),
        degradation_rate: Decimal = Decimal("0.5"),
        years: int = 25,
    ) -> dict:
        """Calculate ROI over N years"""
        irradiation_data = self._load_irradiation_data()
        irradiation = Decimal(str(irradiation_data.get(location, 5.0)))
        
        # Annual generation (kWh) = Capacity (kW) × Irradiation (kWh/kW/day) × 365
        annual_generation = system_capacity_kw * irradiation * Decimal("365")
        
        # Calculate savings over years with degradation
        total_savings = Decimal("0")
        annual_savings_list = []
        
        for year in range(1, years + 1):
            # Apply degradation
            current_capacity = system_capacity_kw * (1 - degradation_rate / 100) ** (year - 1)
            current_generation = current_capacity * irradiation * Decimal("365")
            annual_savings = current_generation * electricity_rate
            total_savings += annual_savings
            annual_savings_list.append({
                "year": year,
                "generation_kwh": float(current_generation),
                "savings": float(annual_savings),
            })
        
        # ROI calculation
        net_savings = total_savings - installation_cost
        roi_percentage = (net_savings / installation_cost * 100) if installation_cost > 0 else Decimal("0")
        
        # Payback period
        cumulative_savings = Decimal("0")
        payback_years = None
        for year_data in annual_savings_list:
            cumulative_savings += Decimal(str(year_data["savings"]))
            if cumulative_savings >= installation_cost and payback_years is None:
                payback_years = year_data["year"]
        
        # NPV (simplified, assuming discount rate of 8%)
        discount_rate = Decimal("0.08")
        npv = Decimal("0")
        for year_data in annual_savings_list:
            npv += Decimal(str(year_data["savings"])) / ((1 + discount_rate) ** year_data["year"])
        npv -= installation_cost
        
        return {
            "total_savings": total_savings,
            "net_savings": net_savings,
            "roi_percentage": roi_percentage,
            "payback_period_years": payback_years or years,
            "npv": npv,
            "annual_savings": annual_savings_list,
            "installation_cost": installation_cost,
            "system_capacity_kw": system_capacity_kw,
            "years": years,
        }

