import { ComponentType } from "react";

export interface RegisterRequestBody {
	name: string;
	email: string;
	password: string;
}

export interface MetricsCardData {
	name: string;
	value: string | number;
	unit?: string;
	icon?: React.ReactNode;
	graphData: {
		v: number;
		high?: boolean;
	}[];
	className?: string;
	status?: string;
}
export interface ArticleCardData {
	title: string;
	description: string;
	image: string;
}

export interface ExerciseCardData {
	title: string;
	image: string;
}

export interface RecentScanProps {
	report: {
		confidenceAverage: number;
		condition: string;
		date: string;
	};
	chartData: {
		v: number;
		high?: boolean;
	}[];
}

export interface ProfileCardProps {
  name: string;
  email: string;
  image: string;
}

type Feature = {
  icon?: ComponentType<{ className?: string }>;
  title: string;
  description: string;
};

export type FeatureCardsProps = {
  features: Feature[];
};
