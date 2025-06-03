import React from "react";
import { User, Users, Heart, FileText, Check } from "lucide-react";

interface FormProgressStepsProps {
    currentStep: number;
}

export const FormProgressSteps: React.FC<FormProgressStepsProps> = ({
    currentStep,
}) => {
    const steps = [
        { number: 1, title: "Basic Info", icon: User },
        { number: 2, title: "Family", icon: Users },
        { number: 3, title: "Sponsor", icon: Heart },
        { number: 4, title: "Details", icon: FileText },
    ];

    return (
        <div className="mb-8">
            <div className="flex items-center justify-center space-x-2 md:space-x-8">
                {steps.map((step, index) => {
                    const Icon = step.icon;
                    const isActive = currentStep === step.number;
                    const isCompleted = currentStep > step.number;

                    return (
                        <div key={step.number} className="flex items-center">
                            <div
                                className={`flex items-center space-x-3 transition-all duration-300 ${isActive
                                        ? "text-blue-600 scale-105"
                                        : isCompleted
                                            ? "text-green-600"
                                            : "text-gray-400"
                                    }`}
                            >
                                <div
                                    className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 relative ${isActive
                                            ? "border-blue-600 bg-blue-50 shadow-lg shadow-blue-200"
                                            : isCompleted
                                                ? "border-green-600 bg-green-50"
                                                : "border-gray-300 bg-white"
                                        }`}
                                >
                                    {isCompleted ? <Check size={20} /> : <Icon size={20} />}
                                    {isActive && (
                                        <div className="absolute inset-0 rounded-full border-2 border-blue-300 animate-ping" />
                                    )}
                                </div>
                                <div className="hidden md:block">
                                    <div className="font-semibold text-sm">{step.title}</div>
                                    <div className="text-xs opacity-70">Step {step.number}</div>
                                </div>
                            </div>
                            {index < steps.length - 1 && (
                                <div
                                    className={`w-8 h-1 mx-2 md:mx-4 rounded transition-all duration-300 ${isCompleted ? "bg-green-400" : "bg-gray-300"
                                        }`}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};