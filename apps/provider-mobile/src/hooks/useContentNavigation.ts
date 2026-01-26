import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ProviderRootStackParamList } from "../navigation/RootNavigator";

type ContentPageNavigation = NativeStackNavigationProp<
  ProviderRootStackParamList,
  "ContentPage"
>;

export const useContentNavigation = () => {
  const navigation = useNavigation<ContentPageNavigation>();

  const navigateToPage = (
    slug: string,
    title?: string,
    role: "PROVIDER" | "ADMIN" = "PROVIDER"
  ) => {
    navigation.push("ContentPage", {
      slug,
      title: title || slug.replace(/-/g, " "),
      role,
    });
  };

  return { navigateToPage };
};
